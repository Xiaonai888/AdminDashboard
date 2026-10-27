import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const ROOT = `${API}/api/admin/country-settings`
const REGIONS = ['kh', 'international']
const DEFAULT_RULES = {
  kh: { app: true, physicalBooks: true, binancePay: false, payway: true, shadowMall: true, readerMall: true, payoutBank: true, payoutBinance: false, payoutPhone: true, storyLanguage: 'km', shopTarget: 'shadow_mall' },
  international: { app: false, physicalBooks: false, binancePay: true, payway: false, shadowMall: false, readerMall: false, payoutBank: false, payoutBinance: false, payoutPhone: true, storyLanguage: 'en', shopTarget: 'diamonds' },
}
const FEATURES = [
  { key: 'app', title: 'Mine > App', detail: 'Display the App entry and its available tools.', icon: '▦', tone: 'violet' },
  { key: 'physicalBooks', title: 'Physical Books', detail: 'Allow access to physical book shopping.', icon: '▤', tone: 'rose' },
  { key: 'binancePay', title: 'Binance Pay', detail: 'Show Binance in Diamond payment methods.', icon: '◆', tone: 'amber' },
  { key: 'payway', title: 'ABA / PayWay', detail: 'Show PayWay in Diamond payment methods.', icon: '▣', tone: 'blue' },
  { key: 'shadowMall', title: 'Shadow Mall', detail: 'Show or hide the Shadow Mall shopping entry.', icon: '🛍', tone: 'orange' },
  { key: 'readerMall', title: 'Reader Mall', detail: 'Show or hide Reader Profile > Mall.', icon: '🛒', tone: 'green' },
  { key: 'payoutBank', title: 'Author Payout · Bank QR', detail: 'Allow authors to choose Bank QR for receiving payouts.', icon: '▣', tone: 'blue' },
  { key: 'payoutBinance', title: 'Author Payout · Binance', detail: 'Allow authors to choose Binance for receiving payouts. Separate from Diamond purchases.', icon: '◆', tone: 'amber' },
  { key: 'payoutPhone', title: 'Author Payout · Phone', detail: 'Allow authors to choose a phone-number payout provider.', icon: '☎', tone: 'rose' },
]
const LANGUAGE_OPTIONS = [
  { value: 'km', label: 'Khmer' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
]
const SHOP_OPTIONS = [
  { value: 'shadow_mall', label: 'Shadow Mall' },
  { value: 'diamonds', label: 'Buy Diamonds' },
]
const OVERRIDE_OPTIONS = [
  { value: 'inherit', label: 'Use Country Rule' },
  { value: 'allow', label: 'Allow' },
  { value: 'block', label: 'Block' },
]
const DEFAULT_OVERRIDE = {
  app: 'inherit',
  physicalBooks: 'inherit',
  binancePay: 'inherit',
  payway: 'inherit',
  shadowMall: 'inherit',
  readerMall: 'inherit',
  payoutBank: 'inherit',
  payoutBinance: 'inherit',
  payoutPhone: 'inherit',
  storyLanguage: 'inherit',
  shopTarget: 'inherit',
}

const styles = `
  .csp{max-width:1450px;margin:0 auto;display:grid;gap:18px;color:#17213b;font-family:inherit}
  .csp *{box-sizing:border-box}
  .csp-heading{display:flex;align-items:center;gap:15px;margin-bottom:2px}
  .csp-header-icon{width:62px;height:62px;display:grid;place-items:center;background:#eae9ff;border-radius:17px;color:#4f46e5;font-size:28px;flex-shrink:0}
  .csp-h1{font-size:27px;font-weight:900;letter-spacing:-.7px;margin:0;color:#131c38}
  .csp-sub{color:#6b7893;font-size:13px;margin:5px 0 0;line-height:1.5}
  .csp-tabs{display:flex;flex-wrap:wrap;gap:9px}
  .csp-tab{border:1px solid #e4e9f4;background:#f6f8fc;border-radius:13px;padding:12px 20px;color:#55637e;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:9px}
  .csp-tab.active{background:#fff;color:#4f46e5;border-color:#d8dbff;box-shadow:0 2px 0 #4f46e5}
  .csp-card{background:#fff;border:1px solid #e4e9f4;border-radius:18px;box-shadow:0 5px 18px #17255408;min-width:0;overflow:hidden}
  .csp-card-body{padding:17px}
  .csp-card-head{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:17px 18px;flex-wrap:wrap}
  .csp-card-name{display:flex;align-items:center;gap:11px;min-width:0}
  .csp-gear{width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:#eae9ff;color:#4f46e5;font-size:23px;flex-shrink:0}
  .csp-h2{font-size:16px;font-weight:900;margin:0;color:#151e35}
  .csp-help{font-size:12px;color:#76849b;margin:5px 0 0;line-height:1.5}
  .csp-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
  .csp-button{border:1px solid #dfe5ef;border-radius:11px;background:#fff;color:#465571;padding:10px 15px;min-height:40px;font-size:12px;font-weight:800;cursor:pointer}
  .csp-button.primary{border-color:#4f46e5;color:#fff;background:#4f46e5}
  .csp-button.danger{color:#dc2626;border-color:#fecaca;background:#fff7f7}
  .csp-button:disabled{opacity:.45;cursor:not-allowed}
  .csp-notice{border:1px solid #e3e8f4;background:#f8faff;border-radius:11px;padding:11px 14px;font-size:12px;line-height:1.5;color:#586680}
  .csp-notice.error{border-color:#fecaca;background:#fff1f2;color:#b91c1c}
  .csp-notice.success{border-color:#bbf7d0;background:#f0fdf4;color:#15803d}
  .csp-table-scroll{overflow-x:auto;scrollbar-width:thin}
  .csp-table{width:100%;min-width:880px;border-collapse:collapse}
  .csp-table th{font-size:12px;font-weight:900;color:#34405b;text-align:left;background:#f8faff;padding:15px 12px;border-top:1px solid #edf0f7;border-bottom:1px solid #edf0f7}
  .csp-table th:first-child,.csp-table td:first-child{padding-left:17px}
  .csp-table th:last-child,.csp-table td:last-child{padding-right:17px}
  .csp-table td{padding:13px 12px;border-bottom:1px solid #eef1f7;vertical-align:middle;font-size:12px}
  .csp-table tr:last-child td{border-bottom:0}
  .csp-table th:nth-child(3),.csp-table th:nth-child(4),.csp-table th:nth-child(5),.csp-table td:nth-child(3),.csp-table td:nth-child(4),.csp-table td:nth-child(5){text-align:center}
  .csp-feature{display:flex;align-items:center;gap:12px;min-width:180px}
  .csp-feature-icon{width:36px;height:36px;display:grid;place-items:center;border-radius:10px;font-weight:900;font-size:19px;flex-shrink:0}
  .csp-feature-icon.violet{background:#eae7ff;color:#6351d3}
  .csp-feature-icon.rose{background:#ffe5ec;color:#ef4267}
  .csp-feature-icon.amber{background:#fff1c9;color:#d49a00}
  .csp-feature-icon.blue{background:#deecff;color:#2870d7}
  .csp-feature-icon.green{background:#dcfce7;color:#16a34a}
  .csp-feature-icon.orange{background:#ffedd5;color:#ea580c}
  .csp-feature-name{font-size:13px;font-weight:850;color:#1c253c}
  .csp-feature-desc{font-size:12px;color:#687890;line-height:1.5;max-width:290px}
  .csp-toggle{position:relative;display:inline-block;width:46px;height:26px;border:0;border-radius:999px;background:#cbd1db;cursor:pointer;vertical-align:middle;transition:background .18s}
  .csp-toggle::after{content:'';position:absolute;left:3px;top:3px;width:20px;height:20px;background:#fff;border-radius:50%;box-shadow:0 1px 3px #0002;transition:transform .18s}
  .csp-toggle.on{background:#4f46e5}
  .csp-toggle.on::after{transform:translateX(20px)}
  .csp-toggle:focus-visible,.csp-button:focus-visible,.csp-select:focus-visible,.csp-input:focus-visible,.csp-tab:focus-visible{outline:3px solid #c7d2fe;outline-offset:2px}
  .csp-select{height:37px;padding:0 9px;border:1px solid #dce3ef;border-radius:10px;background:#fff;color:#25314b;font:inherit;font-size:12px;min-width:135px;max-width:100%;cursor:pointer}
  .csp-select.compact{min-width:170px}
  .csp-input{min-height:41px;width:100%;min-width:0;border:1px solid #dce3ef;border-radius:11px;padding:10px 13px;font:inherit;font-size:13px;color:#1c2940;background:#fff;outline:none}
  .csp-field{display:grid;gap:7px;min-width:0}
  .csp-field-label{font-size:12px;font-weight:800;color:#4c5e77}
  .csp-preview{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .csp-preview-card{padding:15px;border:1px solid #e5eaf3;border-radius:14px;background:#fff;min-width:0}
  .csp-preview-title{display:flex;align-items:center;gap:9px;font-weight:850;font-size:13px;margin-bottom:13px}
  .csp-flag{font-size:23px}
  .csp-preview-line{display:flex;gap:9px;align-items:flex-start;margin:9px 0;font-size:12px;line-height:1.4;color:#475569}
  .csp-check{display:grid;place-items:center;width:17px;height:17px;flex-shrink:0;border-radius:50%;background:#dcfce7;color:#15803d;font-size:11px;font-weight:900}
  .csp-check.no{background:#fee2e2;color:#dc2626}
  .csp-section-label{display:flex;gap:8px;align-items:center;color:#25314a;font-weight:850;font-size:14px;margin:0 0 13px}
  .csp-bottom{display:grid;grid-template-columns:1fr;gap:15px}
  .csp-exception-content{display:grid;gap:18px;padding:18px}
  .csp-search-row{display:flex;gap:10px;align-items:end}
  .csp-search-row>.csp-field{flex:1}
  .csp-list{display:grid;gap:9px}
  .csp-user{display:flex;gap:11px;align-items:center;justify-content:space-between;border:1px solid #e4e9f4;background:#fff;border-radius:12px;padding:11px 12px;text-align:left;width:100%;cursor:pointer;font:inherit}
  .csp-user.selected{border-color:#a5b4fc;background:#f5f4ff}
  .csp-user-name{font-size:13px;color:#152038;font-weight:850}
  .csp-user-meta{font-size:11px;color:#7c8ba2;margin-top:3px;overflow-wrap:anywhere}
  .csp-avatar{display:grid;place-items:center;height:37px;width:37px;border-radius:50%;background:#eae9ff;color:#4f46e5;font-weight:900;flex-shrink:0}
  .csp-exception-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}
  .csp-override-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px}
  .csp-chip{display:inline-flex;align-items:center;min-height:25px;border-radius:999px;padding:4px 9px;font-size:10px;font-weight:850;background:#eef2ff;color:#4f46e5}
  .csp-row{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap}
  .csp-empty{font-size:12px;color:#8794aa;padding:15px;text-align:center;border:1px dashed #dce3ef;border-radius:12px}
  .csp-exception-list{display:grid;gap:8px}
  @media(max-width:1100px){.csp-h1{font-size:23px}.csp-preview{grid-template-columns:1fr 1fr}.csp-override-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:660px){.csp{gap:13px}.csp-heading{gap:11px}.csp-header-icon{width:48px;height:48px;font-size:21px}.csp-h1{font-size:20px}.csp-card-head{padding:13px}.csp-card-body{padding:13px}.csp-preview{grid-template-columns:1fr}.csp-exception-content{padding:13px}.csp-exception-grid,.csp-override-grid{grid-template-columns:1fr}.csp-actions{width:100%}.csp-actions .csp-button{flex:1}.csp-search-row{flex-direction:column;align-items:stretch}.csp-search-row .csp-button{width:100%}}
`

function authHeaders(json = false) {
  const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${ROOT}${path}`, {
    cache: 'no-store',
    ...options,
    headers: { ...authHeaders(Boolean(options.body)), ...(options.headers || {}) },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.ok !== true) throw new Error(payload.message || `Request failed (${response.status})`)
  return payload
}

function normalizeRules(rules) {
  if (!rules || typeof rules !== 'object') throw new Error('Invalid country rules')
  const normalized = {}
  for (const region of REGIONS) {
    if (!rules[region] || typeof rules[region] !== 'object') throw new Error('Missing region rules')
    normalized[region] = {}
    for (const feature of FEATURES) {
      const flag = rules[region][feature.key]
      if (flag !== undefined && typeof flag !== 'boolean') throw new Error('Invalid feature rule')
      if (flag === undefined && !['shadowMall', 'readerMall', 'payoutBank', 'payoutBinance', 'payoutPhone'].includes(feature.key)) throw new Error('Invalid feature rule')
      normalized[region][feature.key] = flag === undefined ? DEFAULT_RULES[region][feature.key] : flag
    }
    const language = rules[region].storyLanguage
    const shopTarget = rules[region].shopTarget
    if (!LANGUAGE_OPTIONS.some(item => item.value === language)) throw new Error('Invalid language rule')
    if (!SHOP_OPTIONS.some(item => item.value === shopTarget)) throw new Error('Invalid shopping rule')
    normalized[region].storyLanguage = language
    normalized[region].shopTarget = shopTarget
  }
  return normalized
}

function getQuickMode(rules, key) {
  const kh = rules.kh[key]
  const abroad = rules.international[key]
  if (kh && abroad) return 'all'
  if (kh && !abroad) return 'kh'
  if (!kh && abroad) return 'international'
  return 'none'
}

function Toggle({ checked, label, onChange }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`csp-toggle${checked ? ' on' : ''}`} onClick={() => onChange(!checked)} />
}

function PreviewItem({ allowed, children }) {
  return <div className="csp-preview-line"><span className={`csp-check${allowed ? '' : ' no'}`}>{allowed ? '✓' : '×'}</span><span>{children}</span></div>
}

function UserAvatar({ name }) {
  const initial = String(name || 'U').trim().slice(0, 1).toUpperCase()
  return <span className="csp-avatar" aria-hidden="true">{initial}</span>
}

function formatUser(item) {
  return {
    id: String(item?.id || item?.userId || ''),
    name: String(item?.name || item?.username || item?.full_name || 'Reader'),
    email: String(item?.email || ''),
  }
}

export default function AdminCountrySettingsPage() {
  const [tab, setTab] = useState('rules')
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [savedRules, setSavedRules] = useState(DEFAULT_RULES)
  const [ready, setReady] = useState(false)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [retry, setRetry] = useState(0)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [exceptionMode, setExceptionMode] = useState('cambodia_experience')
  const [overrides, setOverrides] = useState(DEFAULT_OVERRIDE)
  const [exceptions, setExceptions] = useState([])
  const [exceptionsPage, setExceptionsPage] = useState(1)
  const [exceptionsTotal, setExceptionsTotal] = useState(0)
  const [exceptionsLoading, setExceptionsLoading] = useState(false)
  const [exceptionSaving, setExceptionSaving] = useState(false)
  const changed = useMemo(() => JSON.stringify(rules) !== JSON.stringify(savedRules), [rules, savedRules])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setReady(false)
    setMessage('')
    request('', { signal: controller.signal })
      .then(data => {
        if (!data.rules) throw new Error('Country rules API is not ready')
        const next = normalizeRules(data.rules)
        setRules(next)
        setSavedRules(next)
        setConnected(true)
      })
      .catch(error => {
        if (controller.signal.aborted) return
        setConnected(false)
        setRules(DEFAULT_RULES)
        setSavedRules(DEFAULT_RULES)
        setMessage(error.message || 'Country Settings API is not connected')
        setMessageType('error')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
          setReady(true)
        }
      })
    return () => controller.abort()
  }, [retry])

  const refreshExceptions = useCallback(async (page = 1, signal) => {
    setExceptionsLoading(true)
    try {
      const data = await request(`/exceptions?page=${page}&limit=10`, { signal })
      if (signal?.aborted) return
      setExceptions(Array.isArray(data.exceptions) ? data.exceptions : [])
      setExceptionsTotal(Number(data.total || 0))
    } catch (error) {
      if (!signal?.aborted) {
        setMessage(error.message || 'Could not load exceptions')
        setMessageType('error')
      }
    } finally {
      if (!signal?.aborted) setExceptionsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab !== 'exceptions' || !connected) return undefined
    const controller = new AbortController()
    void refreshExceptions(exceptionsPage, controller.signal)
    return () => controller.abort()
  }, [tab, connected, exceptionsPage, refreshExceptions])

  useEffect(() => {
    const value = search.trim()
    if (tab !== 'exceptions' || !connected || value.length < 2) {
      setSearchResults([])
      setSearching(false)
      return undefined
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)
      try {
        const data = await request(`/users?search=${encodeURIComponent(value)}&limit=10`, { signal: controller.signal })
        if (!controller.signal.aborted) setSearchResults((Array.isArray(data.users) ? data.users : []).map(formatUser).filter(item => item.id))
      } catch (error) {
        if (!controller.signal.aborted) {
          setSearchResults([])
          setMessage(error.message || 'User search failed')
          setMessageType('error')
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 350)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [search, tab, connected])

  function setFeature(region, key, value) {
    setRules(current => ({ ...current, [region]: { ...current[region], [key]: value } }))
    setMessage('')
  }

  function setQuickMode(key, mode) {
    setRules(current => ({
      kh: { ...current.kh, [key]: mode === 'all' || mode === 'kh' },
      international: { ...current.international, [key]: mode === 'all' || mode === 'international' },
    }))
    setMessage('')
  }

  async function saveRules() {
    if (!connected || !changed || saving) return
    setSaving(true)
    setMessage('')
    try {
      const data = await request('', { method: 'PUT', body: JSON.stringify({ rules }) })
      const next = normalizeRules(data.rules)
      setRules(next)
      setSavedRules(next)
      setMessage('Country settings saved successfully')
      setMessageType('success')
    } catch (error) {
      setMessage(error.message || 'Failed to save country settings')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  function chooseUser(user) {
    setSelectedUser(user)
    setSearchResults([])
    setSearch('')
    setExceptionMode('cambodia_experience')
    setOverrides(DEFAULT_OVERRIDE)
    setMessage('')
  }

  async function saveException() {
    if (!connected || !selectedUser || exceptionSaving) return
    setExceptionSaving(true)
    setMessage('')
    try {
      await request('/exceptions', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser.id,
          mode: exceptionMode,
          overrides: exceptionMode === 'custom' ? overrides : {},
        }),
      })
      setMessage('User exception saved')
      setMessageType('success')
      setSelectedUser(null)
      setExceptionMode('cambodia_experience')
      setOverrides(DEFAULT_OVERRIDE)
      setExceptionsPage(1)
      await refreshExceptions(1)
    } catch (error) {
      setMessage(error.message || 'Failed to save exception')
      setMessageType('error')
    } finally {
      setExceptionSaving(false)
    }
  }

  async function revokeException(item) {
    const id = item?.id
    if (!id || !window.confirm('Revoke this user exception?')) return
    setExceptionSaving(true)
    setMessage('')
    try {
      await request(`/exceptions/${encodeURIComponent(String(id))}`, { method: 'DELETE' })
      setMessage('User exception revoked')
      setMessageType('success')
      await refreshExceptions(exceptionsPage)
    } catch (error) {
      setMessage(error.message || 'Failed to revoke exception')
      setMessageType('error')
    } finally {
      setExceptionSaving(false)
    }
  }

  return <AdminLayout title="Country Settings" subtitle="Control feature visibility and exceptions by region">
    <style>{styles}</style>
    <div className="csp">
      <div className="csp-heading">
        <div className="csp-header-icon" aria-hidden="true">◎</div>
        <div>
          <h1 className="csp-h1">Country Settings</h1>
          <p className="csp-sub">Control feature visibility, payment methods and default language by country.</p>
        </div>
      </div>

      <div className="csp-tabs" role="tablist" aria-label="Country Settings">
        <button type="button" className={`csp-tab${tab === 'rules' ? ' active' : ''}`} role="tab" aria-selected={tab === 'rules'} onClick={() => { setTab('rules'); setMessage('') }}>◎ Country Rules</button>
        <button type="button" className={`csp-tab${tab === 'exceptions' ? ' active' : ''}`} role="tab" aria-selected={tab === 'exceptions'} onClick={() => { setTab('exceptions'); setMessage('') }}>♙ User Exceptions</button>
      </div>

      {!connected && ready && <div className="csp-notice">Preview mode: example settings only. Backend connection is required before saving real changes. <button className="csp-button" type="button" onClick={() => setRetry(current => current + 1)}>Retry connection</button></div>}
      {message && connected && <div role="status" className={`csp-notice ${messageType}`}>{message}</div>}

      {tab === 'rules' ? <>
        <section className="csp-card">
          <div className="csp-card-head">
            <div className="csp-card-name">
              <span className="csp-gear" aria-hidden="true">⚙</span>
              <div><h2 className="csp-h2">Feature Settings</h2><p className="csp-help">Configure which features are available in each region.</p></div>
            </div>
            <div className="csp-actions">
              <button className="csp-button" type="button" disabled={loading || saving} onClick={() => { setRules(connected ? savedRules : DEFAULT_RULES); setMessage('') }}>Reset Changes</button>
              <button className="csp-button primary" type="button" disabled={!connected || !changed || saving || loading} onClick={saveRules}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
          <div className="csp-table-scroll">
            <table className="csp-table">
              <thead><tr><th>Feature</th><th>Description</th><th>🇰🇭 Cambodia</th><th>🌍 International</th><th>Quick Setting</th></tr></thead>
              <tbody>
                {FEATURES.map(feature => <tr key={feature.key}>
                  <td><div className="csp-feature"><span className={`csp-feature-icon ${feature.tone}`}>{feature.icon}</span><span className="csp-feature-name">{feature.title}</span></div></td>
                  <td><span className="csp-feature-desc">{feature.detail}</span></td>
                  {REGIONS.map(region => <td key={region}><Toggle checked={rules[region][feature.key]} label={`${feature.title} in ${region === 'kh' ? 'Cambodia' : 'International'}`} onChange={value => setFeature(region, feature.key, value)} /></td>)}
                  <td><select className="csp-select compact" aria-label={`${feature.title} availability`} value={getQuickMode(rules, feature.key)} onChange={event => setQuickMode(feature.key, event.target.value)}><option value="kh">Cambodia Only</option><option value="international">International Only</option><option value="all">All Countries</option><option value="none">Disabled</option></select></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </section>

        <section className="csp-card">
          <div className="csp-card-head"><div className="csp-card-name"><span className="csp-gear" aria-hidden="true">◉</span><div><h2 className="csp-h2">Preview by Country</h2><p className="csp-help">How each region appears with the current selections.</p></div></div></div>
          <div className="csp-card-body csp-bottom"><div className="csp-preview">
            {REGIONS.map(region => <div className="csp-preview-card" key={region}>
              <div className="csp-preview-title"><span className="csp-flag">{region === 'kh' ? '🇰🇭' : '🌍'}</span><span>{region === 'kh' ? 'Cambodia (KH)' : 'International (Other Countries)'}</span><span className="csp-chip">{connected ? 'Current Selection' : 'Example'}</span></div>
              {FEATURES.map(feature => <PreviewItem key={feature.key} allowed={rules[region][feature.key]}>{feature.title}</PreviewItem>)}
            </div>)}
          </div></div>
        </section>
      </> : <section className="csp-card">
        <div className="csp-card-head"><div className="csp-card-name"><span className="csp-gear" aria-hidden="true">♙</span><div><h2 className="csp-h2">User Exceptions</h2><p className="csp-help">Set special access for an individual Reader or Author account.</p></div></div></div>
        <div className="csp-exception-content">
          <div className="csp-field"><label className="csp-field-label" htmlFor="csp-search">Search Reader / Author</label><input id="csp-search" className="csp-input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name, email or User ID" autoComplete="off" /></div>
          {searching && <div className="csp-empty">Searching…</div>}
          {search.trim().length >= 2 && !searching && searchResults.length === 0 && <div className="csp-empty">{connected ? 'No matching accounts' : 'Connect Backend to search accounts'}</div>}
          {searchResults.length > 0 && <div className="csp-list">{searchResults.map(user => <button type="button" className="csp-user" key={user.id} onClick={() => chooseUser(user)}><div className="csp-card-name"><UserAvatar name={user.name}/><div><div className="csp-user-name">{user.name}</div><div className="csp-user-meta">{user.email || user.id}</div></div></div><span className="csp-chip">Select</span></button>)}</div>}

          {selectedUser && <div className="csp-card-body" style={{ background: '#f8faff', border: '1px solid #e5eaf3', borderRadius: 13 }}>
            <div className="csp-row" style={{ marginBottom: 15 }}><div className="csp-card-name"><UserAvatar name={selectedUser.name}/><div><div className="csp-user-name">{selectedUser.name}</div><div className="csp-user-meta">{selectedUser.email || selectedUser.id}</div></div></div><button className="csp-button" type="button" onClick={() => setSelectedUser(null)}>Change User</button></div>
            <div className="csp-field"><label htmlFor="csp-mode" className="csp-field-label">Exception Type</label><select id="csp-mode" className="csp-select" value={exceptionMode} onChange={event => setExceptionMode(event.target.value)}><option value="cambodia_experience">Cambodia Experience</option><option value="all_eligible">Allow All Eligible Features</option><option value="custom">Custom Permissions</option></select></div>
            {exceptionMode === 'custom' && <div className="csp-override-grid" style={{ marginTop: 14 }}>
              {FEATURES.map(feature => <div key={feature.key} className="csp-field"><label className="csp-field-label">{feature.title}</label><select aria-label={`${feature.title} exception`} className="csp-select" value={overrides[feature.key]} onChange={event => setOverrides(current => ({ ...current, [feature.key]: event.target.value }))}>{OVERRIDE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>)}
            </div>}
            <div className="csp-row" style={{ marginTop: 15 }}><span className="csp-help">The account will be identified by its User ID.</span><button className="csp-button primary" type="button" disabled={!connected || exceptionSaving} onClick={saveException}>{exceptionSaving ? 'Saving…' : 'Save Exception'}</button></div>
          </div>}

          <div className="csp-row" style={{ marginTop: 6 }}><h3 className="csp-section-label" style={{ margin: 0 }}>Existing Exceptions</h3><span className="csp-chip">{exceptionsTotal} accounts</span></div>
          {exceptionsLoading && <div className="csp-empty">Loading exceptions…</div>}
          {!exceptionsLoading && exceptions.length === 0 && <div className="csp-empty">{connected ? 'No exceptions found' : 'Exceptions will appear after Backend is connected'}</div>}
          {!exceptionsLoading && exceptions.length > 0 && <div className="csp-exception-list">{exceptions.map(item => <div className="csp-user" key={item.id}><div className="csp-card-name"><UserAvatar name={item.userName || item.name}/><div><div className="csp-user-name">{item.userName || item.name || 'Reader'}</div><div className="csp-user-meta">{item.email || item.userId || ''}</div><div className="csp-chip" style={{ marginTop: 5 }}>{String(item.mode || 'custom').replace(/_/g, ' ')}</div></div></div><button className="csp-button danger" type="button" disabled={exceptionSaving} onClick={() => revokeException(item)}>Revoke</button></div>)}</div>}
          <div className="csp-row"><span className="csp-help">Page {exceptionsPage} · 10 per page</span><div className="csp-actions"><button className="csp-button" type="button" disabled={exceptionsPage <= 1 || exceptionsLoading} onClick={() => setExceptionsPage(current => current - 1)}>Previous</button><button className="csp-button" type="button" disabled={exceptionsPage * 10 >= exceptionsTotal || exceptionsLoading} onClick={() => setExceptionsPage(current => current + 1)}>Next</button></div></div>
        </div>
      </section>}
    </div>
  </AdminLayout>
}
