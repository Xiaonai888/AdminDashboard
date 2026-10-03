import { FileArchive, Files, Minimize2, X } from 'lucide-react'

const OPTIONS = [
  {
    id: 'merge',
    title: 'Merge Documents',
    detail: 'Combine multiple Shadow Docs files into one document',
    icon: Files,
  },
  {
    id: 'compress',
    title: 'Compress Document',
    detail: 'Reduce document file size for easier sharing',
    icon: Minimize2,
  },
]

export default function ShadowDocsConversionSheet({
  open = false,
  documentName = 'Docs.doc',
  onClose,
  onSelect,
}) {
  if (!open) return null

  return <div className="sd-conversion-backdrop">
    <style>{`
      .sd-conversion-backdrop{
        position:fixed;
        inset:0;
        z-index:19500;
        display:flex;
        align-items:flex-end;
        justify-content:center;
        background:rgba(0,0,0,.16)
      }
      .sd-conversion-sheet{
        width:min(100%,560px);
        border:1px solid #303136;
        border-bottom:0;
        border-radius:20px 20px 0 0;
        background:#171719;
        color:#f3f3f4;
        font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif
      }
      .sd-conversion-sheet *{box-sizing:border-box}
      .sd-conversion-handle{
        width:42px;
        height:4px;
        margin:8px auto 2px;
        border-radius:999px;
        background:#37383d
      }
      .sd-conversion-head{
        min-height:58px;
        display:grid;
        grid-template-columns:42px minmax(0,1fr) 42px;
        align-items:center;
        padding:0 14px
      }
      .sd-conversion-head strong{
        text-align:center;
        font-size:18px;
        font-weight:750
      }
      .sd-conversion-close{
        width:38px;
        height:38px;
        display:grid;
        place-items:center;
        border:0;
        border-radius:50%;
        background:transparent;
        color:#f1f1f2
      }
      .sd-conversion-file{
        display:grid;
        grid-template-columns:44px minmax(0,1fr);
        align-items:center;
        gap:12px;
        margin:0 16px 14px;
        padding:12px;
        border-radius:12px;
        background:#232427
      }
      .sd-conversion-file-icon{
        width:44px;
        height:44px;
        display:grid;
        place-items:center;
        border-radius:9px;
        background:#2b7cf0;
        color:#fff
      }
      .sd-conversion-file strong{
        display:block;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        font-size:14px
      }
      .sd-conversion-file small{
        display:block;
        margin-top:3px;
        color:#85868d;
        font-size:10px
      }
      .sd-conversion-label{
        display:block;
        margin:0 18px 8px;
        color:#96979e;
        font-size:12px;
        font-weight:650
      }
      .sd-conversion-list{
        margin:0 16px calc(16px + env(safe-area-inset-bottom));
        overflow:hidden;
        border:1px solid #303136;
        border-radius:13px;
        background:#232427
      }
      .sd-conversion-row{
        width:100%;
        min-height:76px;
        display:grid;
        grid-template-columns:40px minmax(0,1fr);
        align-items:center;
        gap:12px;
        border:0;
        border-bottom:1px solid #34353a;
        background:transparent;
        color:#f2f2f3;
        padding:0 15px;
        text-align:left
      }
      .sd-conversion-row:last-child{border-bottom:0}
      .sd-conversion-row:active{background:#2b2c30}
      .sd-conversion-row-icon{
        width:38px;
        height:38px;
        display:grid;
        place-items:center;
        border-radius:9px;
        background:#2c2d31;
        color:#65d7b7
      }
      .sd-conversion-row strong{
        display:block;
        font-size:14px;
        font-weight:650
      }
      .sd-conversion-row small{
        display:block;
        margin-top:4px;
        color:#85868d;
        font-size:10px;
        line-height:1.4
      }
    `}</style>

    <section className="sd-conversion-sheet" role="dialog" aria-modal="true" aria-label="More Conversion Options">
      <div className="sd-conversion-handle" aria-hidden="true" />
      <header className="sd-conversion-head">
        <span />
        <strong>More Conversion Options</strong>
        <button type="button" className="sd-conversion-close" aria-label="Close" onClick={onClose}>
          <X size={21} />
        </button>
      </header>

      <div className="sd-conversion-file">
        <div className="sd-conversion-file-icon"><FileArchive size={23} /></div>
        <div>
          <strong>{documentName}</strong>
          <small>Choose a conversion tool</small>
        </div>
      </div>

      <span className="sd-conversion-label">Tools</span>
      <div className="sd-conversion-list">
        {OPTIONS.map(option => {
          const Icon = option.icon
          return <button type="button" className="sd-conversion-row" key={option.id} onClick={() => onSelect?.(option.id)}>
            <span className="sd-conversion-row-icon"><Icon size={20} /></span>
            <span>
              <strong>{option.title}</strong>
              <small>{option.detail}</small>
            </span>
          </button>
        })}
      </div>
    </section>
  </div>
}
