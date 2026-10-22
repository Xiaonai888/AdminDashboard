import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ImageDropZone from "../components/common/ImageDropZone";
import { uploadMediaLibraryWithProgress } from "../utils/uploadMediaLibraryWithProgress";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://shadow-backend-kucw.onrender.com"
).replace(/\/+$/, "");
const ENDPOINT = "/api/admin/chat-story-library";
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
let cache = { token: "", pages: new Map(), pending: new Map() };

function token() {
  return (
    sessionStorage.getItem("shadow_admin_token") ||
    localStorage.getItem("shadow_admin_token") ||
    ""
  );
}

function canManage() {
  try {
    const admin = JSON.parse(
      sessionStorage.getItem("shadow_admin_user") ||
        localStorage.getItem("shadow_admin_user") ||
        "{}",
    );
    return (
      admin.has_all_permissions === true ||
      ["owner", "admin"].includes(String(admin.role || "").toLowerCase()) ||
      admin.permission_keys?.includes("media_library.manage") === true
    );
  } catch {
    return false;
  }
}

function scopedCache() {
  const current = token();
  if (current !== cache.token)
    cache = { token: current, pages: new Map(), pending: new Map() };
  return cache;
}

async function request(path, { method = "GET", body, account = token() } = {}) {
  if (!account || account !== token()) throw new Error("Please sign in again");
  const response = await fetch(`${API_URL}${ENDPOINT}${path}`, {
    method,
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
    headers: {
      Authorization: `Bearer ${account}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (account !== token())
    throw new Error("Admin account changed. Open this page again");
  if (!response.ok || data.ok === false) {
    if (response.status === 401)
      throw new Error("Your session expired. Please sign in again");
    if (response.status === 403)
      throw new Error("You do not have permission for this action");
    throw new Error(data.message || "Unable to complete this request");
  }
  return data;
}

function loadPage(query, refresh = false) {
  const state = scopedCache();
  const entry = state.pages.get(query);
  if (!refresh && entry && Date.now() - entry.at < 300000)
    return Promise.resolve(entry.value);
  if (state.pending.has(query)) return state.pending.get(query);
  const promise = request(`?${query}`, { account: state.token })
    .then((value) => {
      if (cache === state) {
        if (state.pages.size >= 10)
          state.pages.delete(state.pages.keys().next().value);
        state.pages.set(query, { at: Date.now(), value });
      }
      return value;
    })
    .finally(() => state.pending.delete(query));
  state.pending.set(query, promise);
  return promise;
}

function safeImage(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}

async function preparePortrait(file) {
  if (!file || !TYPES.has(file.type))
    throw new Error("Choose a JPEG, PNG, WebP or AVIF image");
  if (file.size <= 0 || file.size > 5242880)
    throw new Error("Image must be 5 MB or smaller");
  const objectUrl = URL.createObjectURL(file);
  let canvas;
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Unable to read this image"));
      element.src = objectUrl;
    });
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    if (!w || !h || w * h > 40000000)
      throw new Error("Choose an image up to 40 megapixels");
    if (Math.abs(w / h - 9 / 16) > 0.006)
      throw new Error(
        "Choose a portrait image with a 9:16 ratio. The image will not be cropped",
      );
    const scale = Math.min(1, 1350 / w, 2400 / h);
    canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot prepare images");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let blob;
    for (const quality of [0.9, 0.83, 0.76]) {
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality),
      );
      if (!blob) throw new Error("Unable to prepare this image");
      if (blob.size <= 921600) break;
    }
    if (
      !["image/webp", "image/png", "image/jpeg"].includes(blob.type) ||
      blob.size > 5242880
    )
      throw new Error(
        "Image is too large after compression. Choose a smaller image",
      );
    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "") || "background"}.${blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg"}`,
      { type: blob.type },
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}

function Icon({ type = "image" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d={
          type === "plus"
            ? "M12 5v14M5 12h14"
            : type === "refresh"
              ? "M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1"
              : type === "close"
                ? "M6 6l12 12M18 6 6 18"
                : "M4 3h16v18H4zM8 8h.01M4 17l5-5 4 4 3-3 4 4"
        }
      />
    </svg>
  );
}

function Dialog({ title, onClose, busy, children }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const node = ref.current;
    node?.querySelector("input, button")?.focus();
    const onKey = (event) => {
      if (event.key === "Escape" && !busyRef.current) closeRef.current();
      if (event.key !== "Tab") return;
      const focusable = [
        ...(node?.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]',
        ) || []),
      ];
      if (!focusable.length) {
        event.preventDefault();
        node?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !node.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !node.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);
  return (
    <div
      className="csl-layer"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="csl-dialog"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="csl-dialog-title"
        aria-busy={busy}
        tabIndex={-1}
      >
        <div className="csl-dialog-head">
          <h2 id="csl-dialog-title">{title}</h2>
          <button
            className="csl-icon"
            type="button"
            aria-label="Close dialog"
            disabled={busy}
            onClick={onClose}
          >
            <Icon type="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

const css = `
.csl .image-drop-zone{position:relative}.csl .image-drop-zone.dragging{outline:2px dashed #111;outline-offset:6px;border-radius:12px}.csl .image-drop-zone-overlay{position:absolute;inset:0;display:grid;place-items:center;background:#fffffff2;border:2px dashed #111;border-radius:12px;font-weight:700;pointer-events:none}.csl{color:#0f172a;max-width:1500px;margin:auto;font-size:14px}.csl *{box-sizing:border-box}.csl button,.csl input,.csl select{font:inherit}.csl button{cursor:pointer}.csl button:disabled{opacity:.5;cursor:default}.csl button:focus-visible,.csl input:focus-visible,.csl select:focus-visible{outline:2px solid #111827;outline-offset:3px}.csl-panel{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:22px}.csl-top,.csl-toolbar,.csl-actions,.csl-pager,.csl-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.csl-top h2{font-size:20px;margin:0 0 7px}.csl p{color:#64748b;line-height:1.6;margin:0}.csl-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;background:#fff;color:#0f172a;font-weight:650;white-space:nowrap}.csl-button.primary,.csl-filter.active{background:#111;color:#fff;border-color:#111}.csl-button.danger{background:#fff1f2;color:#be123c;border-color:#fecdd3}.csl-toolbar{flex-wrap:wrap;margin:22px 0}.csl-search{display:flex;gap:8px;flex:1;max-width:520px}.csl-search input,.csl-field input{width:100%;min-width:0;border:1px solid #e2e8f0;border-radius:10px;padding:11px 12px;background:#fff;color:#0f172a}.csl-filters{display:flex;gap:5px;flex-wrap:wrap}.csl-filter{border:1px solid #e2e8f0;border-radius:9px;background:#fff;padding:9px 13px;color:#64748b}.csl-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}.csl-card{min-width:0;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;background:#fff}.csl-picture{display:block;width:100%;padding:0;border:0;background:#f1f5f9;aspect-ratio:16/9;overflow:hidden;position:relative}.csl-picture img{width:100%;height:100%;object-fit:cover;object-position:center}.csl-badge{position:absolute;top:10px;left:10px;background:rgba(255,255,255,.94);color:#166534;border-radius:20px;padding:4px 9px;font-size:11px;font-weight:700}.csl-badge.hidden{color:#64748b}.csl-body{padding:14px}.csl-body h3{margin:0 0 5px;font-size:14px;overflow-wrap:anywhere}.csl-body p{font-size:11px}.csl-card-buttons{display:flex;gap:6px;flex-wrap:wrap;margin-top:13px}.csl-card-buttons button{border:1px solid #e2e8f0;border-radius:7px;background:white;color:#475569;padding:7px 9px;font-size:11px}.csl-card-buttons .remove{color:#be123c}.csl-state{padding:65px 20px;text-align:center;color:#64748b;border:1px dashed #e2e8f0;border-radius:14px}.csl-state h3{color:#0f172a}.csl-state .csl-button{margin-top:16px}.csl-alert{padding:12px 15px;border:1px solid #fecdd3;background:#fff1f2;color:#be123c;border-radius:10px;margin:14px 0;line-height:1.6}.csl-notice{padding:11px 14px;border-radius:10px;margin:12px 0;background:#f0fdf4;color:#166534}.csl-pager{justify-content:flex-end;margin-top:22px;color:#64748b}.csl-layer{position:fixed;inset:0;z-index:1100;background:rgba(15,23,42,.5);display:flex;align-items:center;justify-content:center;padding:20px}.csl-dialog{width:min(680px,100%);max-height:calc(100dvh - 40px);overflow-y:auto;border-radius:20px;background:#fff;padding:24px;box-shadow:0 20px 80px #0f172a22}.csl-dialog-head{margin-bottom:20px}.csl-dialog h2{font-size:20px;margin:0}.csl-icon{border:0;background:#f1f5f9;border-radius:50%;width:36px;height:36px;display:grid;place-items:center;color:#475569}.csl-form{display:grid;grid-template-columns:180px minmax(0,1fr);gap:22px}.csl-portrait{aspect-ratio:9/16;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;display:grid;place-items:center;color:#94a3b8}.csl-portrait img{width:100%;height:100%;object-fit:contain}.csl-field{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;font-size:12px;font-weight:650}.csl-field input[type=file]{font-size:11px}.csl-checkbox{display:flex;gap:9px;align-items:center;margin:15px 0;font-size:13px}.csl-checkbox input{accent-color:#111;width:17px;height:17px}.csl-help{font-size:12px}.csl-landscape{aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:#f1f5f9;margin-top:9px}.csl-landscape img{width:100%;height:100%;object-fit:cover}.csl-actions{justify-content:flex-end;margin-top:22px}.csl-full-preview{width:min(320px,100%);margin:0 auto 20px}.csl-full-preview img{display:block;width:100%;height:auto;border-radius:14px}.csl-progress{display:block;margin:14px 0;font-size:12px;color:#475569}.csl button:disabled{pointer-events:none}@media(max-width:1200px){.csl-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:900px){.csl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.csl-top{align-items:flex-start}.csl-top .csl-actions{margin:0}}@media(max-width:600px){.csl-panel{padding:15px}.csl-top{flex-direction:column}.csl-toolbar{align-items:stretch;flex-direction:column}.csl-search{max-width:none}.csl-grid{grid-template-columns:1fr}.csl-form{grid-template-columns:1fr}.csl-portrait{width:140px;margin:auto}.csl-dialog{padding:18px}.csl-layer{padding:10px}.csl-dialog{max-height:calc(100dvh - 20px)}.csl-pager{justify-content:space-between;gap:5px}.csl-pager .csl-button{padding:9px}.csl-top .csl-actions{flex-wrap:wrap}}
`;

export default function AdminChatStoryLibraryPage() {
  const [account, setAccount] = useState(token);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState(null);
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [progress, setProgress] = useState("");
  const mounted = useRef(false);
  const operation = useRef(false);
  const selectionVersion = useRef(0);
  const uploaded = useRef(null);
  const draftId = useRef("");
  const picker = useRef(null);
  const manageable = canManage();

  useEffect(() => {
    mounted.current = true;
    const changed = () => setAccount(token());
    window.addEventListener("focus", changed);
    window.addEventListener("storage", changed);
    return () => {
      mounted.current = false;
      selectionVersion.current += 1;
      window.removeEventListener("focus", changed);
      window.removeEventListener("storage", changed);
    };
  }, []);

  useEffect(() => {
    selectionVersion.current += 1;
    setDialog(null);
    setFile(null);
    setPage(1);
    setItems([]);
    setError("");
    setNotice("");
    uploaded.current = null;
  }, [account]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setItems([]);
    setHasMore(false);
    if (!account) {
      setLoading(false);
      setError("Please sign in to open Chat Story Library");
      return;
    }
    const query = new URLSearchParams({
      page: String(page),
      status: filter,
      q,
    }).toString();
    loadPage(query)
      .then((data) => {
        if (!active || account !== token()) return;
        setItems(Array.isArray(data.items) ? data.items.slice(0, 20) : []);
        setHasMore(data.has_more === true);
      })
      .catch((failure) => {
        if (active) setError(failure.message || "Unable to load backgrounds");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [account, page, filter, q, revision]);

  useEffect(() => {
    if (!busy) return;
    const guard = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [busy]);

  const refresh = () => {
    cache = { token: token(), pages: new Map(), pending: new Map() };
    setRevision((value) => value + 1);
  };
  const close = () => {
    if (operation.current) return;
    selectionVersion.current += 1;
    setPreparing(false);
    setDialog(null);
    setFile(null);
    setFormError("");
    setProgress("");
    uploaded.current = null;
  };
  const openAdd = () => {
    draftId.current = crypto.randomUUID();
    uploaded.current = null;
    setName("");
    setVisible(true);
    setFile(null);
    setFormError("");
    setProgress("");
    setDialog({ kind: "add" });
  };
  const choose = async (event) => {
    const selected = event?.target?.files?.[0] || event?.[0];
    if (event?.target) event.target.value = "";
    if (!selected) return;
    const version = ++selectionVersion.current;
    setPreparing(true);
    setFormError("");
    setFile(null);
    uploaded.current = null;
    try {
      const ready = await preparePortrait(selected);
      if (!mounted.current || version !== selectionVersion.current) return;
      setFile(ready);
      setName(
        (current) =>
          current || selected.name.replace(/\.[^.]+$/, "").slice(0, 120),
      );
    } catch (failure) {
      if (mounted.current && version === selectionVersion.current)
        setFormError(failure.message || "Unable to prepare image");
    } finally {
      if (mounted.current && version === selectionVersion.current)
        setPreparing(false);
    }
  };
  const save = async (event) => {
    event.preventDefault();
    if (operation.current || preparing) return;
    const title = name.trim();
    if (!title || title.length > 120) {
      setFormError("Enter a title of 1 to 120 characters");
      return;
    }
    if (dialog.kind === "add" && !file) {
      setFormError("Choose a 9:16 background first");
      return;
    }
    operation.current = true;
    setBusy(true);
    setFormError("");
    setNotice("");
    const captured = account;
    try {
      if (dialog.kind === "add") {
        if (!uploaded.current) {
          setProgress("Uploading background to Cloudflare…");
          const result = await uploadMediaLibraryWithProgress({
            apiUrl: API_URL,
            token: captured,
            files: [file],
          });
          const image = result.images?.[0];
          if (!image?.storage_key || !safeImage(image.image_url))
            throw new Error("Upload returned an incomplete image");
          uploaded.current = image;
        }
        if (captured !== token())
          throw new Error("Admin account changed. Open this page again");
        if (mounted.current) setProgress("Saving background…");
        await request("", {
          method: "POST",
          account: captured,
          body: {
            id: draftId.current,
            title,
            is_active: visible,
            image_url: uploaded.current.image_url,
            storage_key: uploaded.current.storage_key,
          },
        });
      } else {
        await request(`/${dialog.item.id}`, {
          method: "PATCH",
          account: captured,
          body: { title, is_active: visible },
        });
      }
      cache = { token: token(), pages: new Map(), pending: new Map() };
      if (mounted.current && captured === token()) {
        setDialog(null);
        setFile(null);
        setNotice("Background saved");
        setPage(1);
        setRevision((value) => value + 1);
        uploaded.current = null;
      }
    } catch (failure) {
      if (mounted.current)
        setFormError(failure.message || "Unable to save background");
    } finally {
      operation.current = false;
      if (mounted.current) {
        setBusy(false);
        setProgress("");
      }
    }
  };
  const remove = async () => {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setFormError("");
    try {
      await request(`/${dialog.item.id}`, { method: "DELETE", account });
      cache = { token: token(), pages: new Map(), pending: new Map() };
      if (mounted.current) {
        setDialog(null);
        setNotice("Background removed from Chat Story Library");
        if (items.length === 1 && page > 1) setPage(page - 1);
        else refresh();
      }
    } catch (failure) {
      if (mounted.current)
        setFormError(failure.message || "Unable to remove background");
    } finally {
      operation.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <AdminLayout
      title="Chat Story Library"
      subtitle="Portrait backgrounds for Chat Theme → Shadow"
    >
      <div className="csl">
        <style>{css}</style>
        <section className="csl-panel">
          <div className="csl-top">
            <div>
              <h2>Chat Story backgrounds</h2>
              <p>
                9:16 images · Landscape card previews · Original portrait ratio
                preserved
              </p>
            </div>
            <div className="csl-actions">
              <button
                type="button"
                className="csl-button"
                disabled={loading || busy}
                onClick={refresh}
              >
                <Icon type="refresh" />
                Refresh
              </button>
              {manageable && (
                <button
                  type="button"
                  className="csl-button primary"
                  disabled={busy}
                  onClick={openAdd}
                >
                  <Icon type="plus" />
                  Add Background
                </button>
              )}
            </div>
          </div>
          <div className="csl-toolbar">
            <form
              className="csl-search"
              onSubmit={(event) => {
                event.preventDefault();
                setQ(search.trim());
                setPage(1);
              }}
            >
              <input
                aria-label="Search background titles"
                maxLength={80}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search backgrounds…"
              />
              <button className="csl-button" type="submit">
                Search
              </button>
            </form>
            <div className="csl-filters" aria-label="Background visibility">
              {[
                ["all", "All"],
                ["visible", "Visible"],
                ["hidden", "Hidden"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={`csl-filter${filter === value ? " active" : ""}`}
                  aria-pressed={filter === value}
                  onClick={() => {
                    setFilter(value);
                    setPage(1);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {notice && (
            <div className="csl-notice" role="status">
              {notice}
            </div>
          )}
          {loading ? (
            <div className="csl-state" role="status">
              Loading backgrounds…
            </div>
          ) : error ? (
            <div className="csl-state" role="alert">
              <p>{error}</p>
              <button type="button" className="csl-button" onClick={refresh}>
                Retry
              </button>
            </div>
          ) : !items.length ? (
            <div className="csl-state">
              <Icon />
              <h3>
                {q || filter !== "all"
                  ? "No matching backgrounds"
                  : "No backgrounds yet"}
              </h3>
              <p>
                {q || filter !== "all"
                  ? "Try another search or visibility filter."
                  : "Add a 9:16 image to make it available in Chat Theme → Shadow."}
              </p>
              {manageable && !q && filter === "all" && (
                <button
                  type="button"
                  className="csl-button primary"
                  onClick={openAdd}
                >
                  Add First Background
                </button>
              )}
            </div>
          ) : (
            <div className="csl-grid">
              {items.map((item) => (
                <article key={item.id} className="csl-card">
                  <button
                    type="button"
                    className="csl-picture"
                    aria-label={`Preview ${item.title}`}
                    onClick={() => {
                      setFormError("");
                      setDialog({ kind: "preview", item });
                    }}
                  >
                    <img
                      src={safeImage(item.image_url)}
                      alt={item.title}
                      loading="lazy"
                    />
                    <span
                      className={`csl-badge${item.is_active ? "" : " hidden"}`}
                    >
                      {item.is_active ? "Visible" : "Hidden"}
                    </span>
                  </button>
                  <div className="csl-body">
                    <h3>{item.title}</h3>
                    <p>9:16 background · 16:9 preview</p>
                    {manageable && (
                      <div className="csl-card-buttons">
                        <button
                          type="button"
                          onClick={() => {
                            setName(item.title);
                            setVisible(item.is_active);
                            setFormError("");
                            setDialog({ kind: "edit", item });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="remove"
                          onClick={() => {
                            setFormError("");
                            setDialog({ kind: "remove", item });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && !error && (items.length > 0 || page > 1) && (
            <div className="csl-pager">
              <button
                type="button"
                className="csl-button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </button>
              <span>Page {page} · 20 per page</span>
              <button
                type="button"
                className="csl-button"
                disabled={!hasMore}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
        {dialog && (
          <Dialog
            title={
              dialog.kind === "add"
                ? "Add Background"
                : dialog.kind === "edit"
                  ? "Edit Background"
                  : dialog.kind === "remove"
                    ? "Remove Background"
                    : dialog.item.title
            }
            onClose={close}
            busy={busy}
          >
            {dialog.kind === "add" || dialog.kind === "edit" ? (
              <form onSubmit={save}>
                <ImageDropZone onFiles={choose} disabled={busy || preparing} label="Drop a 9:16 image here">
          <div className="csl-form">
                  <div className="csl-portrait">
                    {preview || dialog.item?.image_url ? (
                      <img
                        src={preview || safeImage(dialog.item.image_url)}
                        alt="Full portrait preview"
                      />
                    ) : (
                      <Icon />
                    )}
                  </div>
                  <div>
                    <label className="csl-field">
                      Background title
                      <input
                        maxLength={120}
                        value={name}
                        disabled={busy}
                        onChange={(event) => setName(event.target.value)}
                        required
                      />
                    </label>
                    {dialog.kind === "add" && (
                      <>
                        <label className="csl-field">
                          Portrait image
                          <input
                            ref={picker}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            disabled={busy || preparing}
                            onChange={choose}
                          />
                        </label>
                        <p className="csl-help">
                          Drop an image here or choose a file · 9:16 · Up to 5 MB · No cropping
                        </p>
                      </>
                    )}
                    <label className="csl-checkbox">
                      <input
                        type="checkbox"
                        checked={visible}
                        disabled={busy}
                        onChange={(event) => setVisible(event.target.checked)}
                      />
                      Visible to readers
                    </label>
                    {(preview || dialog.item?.image_url) && (
                      <>
                        <p className="csl-help">Landscape card preview</p>
                        <div className="csl-landscape">
                          <img
                            src={preview || safeImage(dialog.item.image_url)}
                            alt="Landscape card preview"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
          </ImageDropZone>

                {(preparing || progress) && (
                  <span className="csl-progress" role="status">
                    {preparing ? "Preparing portrait image…" : progress}
                  </span>
                )}
                {formError && (
                  <div className="csl-alert" role="alert">
                    {formError}
                  </div>
                )}
                <div className="csl-actions">
                  <button
                    type="button"
                    className="csl-button"
                    disabled={busy}
                    onClick={close}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="csl-button primary"
                    disabled={
                      busy || preparing || (dialog.kind === "add" && !file)
                    }
                  >
                    {busy ? "Saving…" : "Save Background"}
                  </button>
                </div>
              </form>
            ) : dialog.kind === "remove" ? (
              <>
                <p>
                  Remove “{dialog.item.title}” from Chat Theme → Shadow? The
                  image stays in Media Library.
                </p>
                {formError && (
                  <div className="csl-alert" role="alert">
                    {formError}
                  </div>
                )}
                <div className="csl-actions">
                  <button
                    type="button"
                    className="csl-button"
                    disabled={busy}
                    onClick={close}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="csl-button danger"
                    disabled={busy}
                    onClick={remove}
                  >
                    {busy ? "Removing…" : "Remove Background"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="csl-full-preview">
                  <img
                    src={safeImage(dialog.item.image_url)}
                    alt={dialog.item.title}
                  />
                </div>
                <p className="csl-help">
                  Full portrait background. Landscape cards show a center crop
                  of this image.
                </p>
                <div className="csl-actions">
                  <button type="button" className="csl-button" onClick={close}>
                    Close
                  </button>
                </div>
              </>
            )}
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}

