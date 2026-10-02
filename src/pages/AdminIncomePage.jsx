import AdminStoryPayoutConfirmModal from '../components/AdminStoryPayoutConfirmModal'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'
const PAYOUT_WORKFLOW_READY = import.meta.env.VITE_STORY_PAYOUT_WORKFLOW_READY === 'true'
const incomeSummaryInFlight = new Map()

async function requestIncomeSummary(url, headers) {
  const authKey = String(
    headers?.Authorization ||
    headers?.authorization ||
    ''
  )
  const requestKey = `${url}|${authKey}`
  const existing =
    incomeSummaryInFlight.get(requestKey)

  if (existing) {
    return existing
  }

  const request = (async () => {
    const response = await fetch(url, {
      headers,
    })

    const result =
      await response.json().catch(() => ({}))

    if (
      !response.ok ||
      result.ok === false
    ) {
      throw new Error(
        result.message ||
        'Failed to load income summary'
      )
    }

    return result
  })()

  incomeSummaryInFlight.set(
    requestKey,
    request
  )

  try {
    return await request
  } finally {
    if (
      incomeSummaryInFlight.get(
        requestKey
      ) === request
    ) {
      incomeSummaryInFlight.delete(
        requestKey
      )
    }
  }
}

const styles = `
  .income-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .income-wrap {
    display: grid;
    gap: 18px;
  }

  .income-hero {
    background: linear-gradient(135deg, #111827, #312E81);
    color: #FFFFFF;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
  }

  .income-hero-top {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
  }

  .income-kicker {
    display: inline-flex;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 950;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .income-title {
    margin: 0;
    font-size: 32px;
    font-weight: 950;
    letter-spacing: -0.05em;
  }

  .income-subtitle {
    color: rgba(255, 255, 255, 0.72);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.7;
    margin-top: 8px;
    max-width: 720px;
  }

  .income-filter {
    display: grid;
    grid-template-columns: 155px 175px 42px 110px;
    gap: 10px;
    align-items: center;
  }

  .income-input,
  .income-select,
  .income-reverse {
    height: 42px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 900;
    outline: none;
  }

  .income-select {
    width: 100%;
    cursor: pointer;
  }

  .income-select option {
    color: #0F172A;
    background: #FFFFFF;
  }

  .income-input::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }

  .income-reverse {
    width: 42px;
    padding: 0;
    display: inline-grid;
    place-items: center;
    cursor: pointer;
    transition: transform .15s ease, border-color .15s ease, background .15s ease;
  }

  .income-reverse:hover {
    border-color: rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.16);
  }

  .income-reverse:active {
    transform: scale(.95);
  }

  .income-reverse svg {
    width: 17px;
    height: 17px;
    display: block;
    transition: transform .18s ease;
  }

  .income-reverse.is-asc svg {
    transform: rotate(180deg);
  }

  .income-custom-range {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 8px;
  }

  .income-custom-range .income-input {
    width: 100%;
  }

  .income-range-arrow {
    color: rgba(255, 255, 255, 0.65);
    font-size: 12px;
    font-weight: 950;
  }

  .income-button {
    height: 42px;
    border: 0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #312E81;
    font-size: 13px;
    font-weight: 950;
    cursor: pointer;
  }

  .income-button:disabled,
  .income-payout-button:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .income-rule-strip {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .income-rule {
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.1);
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .income-rule-label {
    color: rgba(255, 255, 255, 0.62);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .income-rule-value {
    margin-top: 4px;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 950;
  }

  .income-main-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 16px;
  }

  .income-main-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 26px;
    padding: 22px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.045);
  }

  .income-main-card.primary {
    border-color: #C7D2FE;
    background: linear-gradient(180deg, #FFFFFF, #F8FAFF);
  }

  .income-card-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 950;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .income-card-value {
    color: #0F172A;
    font-size: 34px;
    font-weight: 950;
    letter-spacing: -0.05em;
    margin-top: 10px;
  }

  .income-card-sub {
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.6;
    margin-top: 8px;
  }

  .income-mini-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
  }

  .income-mini-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 16px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.035);
  }

  .income-mini-value {
    color: #0F172A;
    font-size: 22px;
    font-weight: 950;
    letter-spacing: -0.04em;
    margin-top: 8px;
  }

  .income-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 26px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .income-panel-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .income-panel-title {
    font-size: 16px;
    font-weight: 950;
    color: #0F172A;
  }

  .income-pill {
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 950;
  }

  .income-message {
    border-radius: 16px;
    padding: 13px 14px;
    background: #FEF3C7;
    color: #92400E;
    font-size: 12px;
    font-weight: 900;
  }

  .income-success {
    background: #DCFCE7;
    color: #166534;
  }

  .income-empty {
    padding: 46px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 950;
  }

  .income-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .income-table {
    width: 100%;
    border-collapse: collapse;
  }

  .income-table th {
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .04em;
    padding: 13px 20px;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
    white-space: nowrap;
  }

  .income-table td {
    padding: 16px 20px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 850;
    vertical-align: top;
  }

  .income-table tr:last-child td {
    border-bottom: 0;
  }

  .income-source-name {
    font-size: 14px;
    font-weight: 950;
    color: #0F172A;
  }

  .income-small {
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.6;
    margin-top: 4px;
  }

  .income-money {
    font-size: 15px;
    font-weight: 950;
    color: #0F172A;
    white-space: nowrap;
  }

  .income-withdraw-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) 170px;
    gap: 12px;
    padding: 18px 20px;
    align-items: center;
  }

  .income-withdraw-item {
    border-radius: 18px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    padding: 13px;
  }

  .income-withdraw-action {
    height: 44px;
    border: 0;
    border-radius: 15px;
    background: #4F46E5;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 950;
    cursor: pointer;
  }

  .income-payout-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    align-items: center;
  }

  .income-payout-field {
    height: 40px;
    border: 1px solid #CBD5E1;
    border-radius: 13px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 11px;
    font-size: 12px;
    font-weight: 850;
    outline: none;
  }

  .income-payout-button {
    height: 40px;
    border: 0;
    border-radius: 13px;
    padding: 0 14px;
    background: #4F46E5;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 950;
    cursor: pointer;
  }

  .income-payout-button.secondary {
    background: #EEF2FF;
    color: #4338CA;
  }

  .income-payout-button.paid {
    background: #16A34A;
  }

  .income-payout-summary {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #E2E8F0;
    background: #F8FAFC;
  }

  .income-status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 950;
    white-space: nowrap;
    background: #E2E8F0;
    color: #475569;
  }

  .income-status.scheduled {
    background: #DBEAFE;
    color: #1D4ED8;
  }

  .income-status.awaiting_receipt {
    background: #FEF3C7;
    color: #92400E;
  }

  .income-status.paid {
    background: #DCFCE7;
    color: #15803D;
  }

  .income-status.missing_payment_method {
    background: #FEF3C7;
    color: #B45309;
  }

  .income-status.failed {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .income-payout-warning {
    margin: 14px 20px;
    padding: 13px 15px;
    border-radius: 14px;
    background: #FEF3C7;
    color: #92400E;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.6;
  }

  .income-status.cancelled {
    background: #F1F5F9;
    color: #64748B;
  }

  @media (max-width: 1180px) {
    .income-hero-top {
      display: grid;
    }

    .income-main-grid,
    .income-mini-grid,
    .income-payout-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .income-rule-strip,
    .income-withdraw-grid {
      grid-template-columns: 1fr 1fr;
    }

    .income-filter {
      grid-template-columns: 1fr 1fr 42px 110px;
    }
  }

  @media (max-width: 760px) {
    .income-wrap {
      gap: 14px;
    }

    .income-hero {
      border-radius: 22px;
      padding: 18px 16px;
    }

    .income-title {
      font-size: 26px;
    }

    .income-filter,
    .income-main-grid,
    .income-mini-grid,
    .income-rule-strip,
    .income-withdraw-grid,
    .income-payout-summary {
      grid-template-columns: 1fr;
    }

    .income-filter,
    .income-payout-tools {
      width: 100%;
    }

    .income-input,
    .income-select,
    .income-button,
    .income-withdraw-action,
    .income-payout-field,
    .income-payout-button {
      width: 100%;
      box-sizing: border-box;
    }

    .income-main-card,
    .income-mini-card,
    .income-panel {
      border-radius: 20px;
    }

    .income-card-value {
      font-size: 28px;
    }

    .income-panel-head {
      align-items: flex-start;
      flex-direction: column;
      padding: 15px;
    }

    .income-withdraw-grid,
    .income-payout-summary {
      padding: 14px;
    }

    .income-table {
      min-width: 840px;
    }
  }
`

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token')
  )
}

function authHeaders(withJson = false) {
  const token = getAdminToken()

  return {
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
    ...(withJson
      ? { 'Content-Type': 'application/json' }
      : {}),
  }
}

function formatUsd(value) {
  const number = Number(value || 0)
  return `$${number.toFixed(2)}`
}

function sourceName(source) {
  if (source === 'episode_sales') return 'Episode Sales'
  if (source === 'diamond_gifts') return 'Diamond Gifts'
  if (source === 'author_store') {
    return 'Author Page Book/PDF'
  }
  if (source === 'shadow_mall') return 'Shadow Mall'

  return String(source || '-').replace(/_/g, ' ')
}

function getCambodiaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  )

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  }
}

function getTodayInputValue() {
  const { year, month, day } = getCambodiaDateParts()

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getMonthStartInputValue() {
  const { year, month } = getCambodiaDateParts()

  return `${year}-${String(month).padStart(2, '0')}-01`
}


function inputDateValue(date) {
  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, '0')}-${String(
    date.getUTCDate()
  ).padStart(2, '0')}`
}

function getIncomePresetRange(key) {
  if (key === 'all') {
    return { from: '', to: '' }
  }

  const { year, month, day } =
    getCambodiaDateParts()
  const today = new Date(
    Date.UTC(year, month - 1, day)
  )
  let fromDate = new Date(today)

  if (key === 'week') {
    const mondayOffset =
      (today.getUTCDay() + 6) % 7
    fromDate.setUTCDate(
      today.getUTCDate() - mondayOffset
    )
  } else if (key === 'month') {
    fromDate = new Date(
      Date.UTC(year, month - 1, 1)
    )
  } else if (key === 'year') {
    fromDate = new Date(
      Date.UTC(year, 0, 1)
    )
  }

  return {
    from: inputDateValue(fromDate),
    to: inputDateValue(today),
  }
}

function customBoundary(value) {
  if (!value) return ''

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(
    value
  )
    ? `${value}:00+07:00`
    : value
}

function sourceRecordCount(source) {
  return Number(
    source?.gift_transaction_count ||
    source?.order_count ||
    0
  )
}

function sourceSortValue(source, field) {
  if (field === 'gross_sales') {
    return Number(source?.gross_sales_usd || 0)
  }

  if (field === 'author_earnings') {
    return Number(
      source?.author_earnings_usd || 0
    )
  }

  if (field === 'pending_payout') {
    return Number(
      source?.pending_payout_usd || 0
    )
  }

  if (field === 'records') {
    return sourceRecordCount(source)
  }

  return Number(
    source?.platform_income_usd || 0
  )
}

function ReverseIcon() {
  return (
    <svg
      viewBox="0 0 991 990.26"
      aria-hidden="true"
    >
      <path
        d="M294.44,259.81c-3.04-.79-3.51,1.26-5.27,2.61-13.46,10.32-25.01,26.57-36.79,38.67-43.3,44.41-87.71,87.81-130.75,132.49-72.42,56.93-160.05-31.24-103.6-103.6L326.92,15.87c52.21-34.61,110.74-2.4,115.02,58.71,4.9,69.91-1.64,148.89-1.92,219.36-.81,207.68.8,415.37.06,623.05-7.16,87.69-118.74,100.14-144.81,18.51-6.03-154.72-1.62-311.03-.75-465.91.39-69.92-.44-139.88-.08-209.77Z"
        fill="currentColor"
      />
      <path
        d="M699.85,737.13l172.8-173.78c65.9-51.24,150.5,26.44,105.9,97.13-102.13,106.38-206.92,210.8-311.22,315.27-50.98,34.86-108.82,1.13-113.22-58.68-5.8-78.82,1.62-169.48,1.91-249.18.7-198.93-.65-397.88-.15-596.81,7.12-91.33,130.74-95.8,145.53-6.77l-1.55,672.81Z"
        fill="currentColor"
      />
    </svg>
  )
}

function getPreviousMonthValue() {
  const { year, month } = getCambodiaDateParts()
  const previousMonth = new Date(
    Date.UTC(year, month - 2, 1)
  )

  return `${previousMonth.getUTCFullYear()}-${String(
    previousMonth.getUTCMonth() + 1
  ).padStart(2, '0')}`
}

function findSource(sources, name) {
  return (
    (sources || []).find(
      (source) => source.source === name
    ) || {}
  )
}

function payoutAuthorName(payout) {
  return (
    payout?.author_page?.page_name ||
    payout?.author_page?.page_username ||
    payout?.author_user?.name ||
    payout?.author_user?.username ||
    'Author'
  )
}

function payoutPaymentText(payout) {
  const method =
    payout?.payment_method_snapshot || {}

  if (!payout?.payment_method_id) {
    return 'Missing payment method'
  }

  return (
    method.display_name ||
    method.bank_name ||
    method.method_type ||
    'Payment method'
  )
}

export default function AdminIncomePage() {
  const navigate = useNavigate()
  const [rangeKey, setRangeKey] =
    useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [customFrom, setCustomFrom] =
    useState('')
  const [customTo, setCustomTo] =
    useState('')
  const [sortField, setSortField] =
    useState('platform_income')
  const [sortDirection, setSortDirection] =
    useState('desc')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')

  const [payoutMonth, setPayoutMonth] =
    useState(getPreviousMonthValue())
  const [payoutStatus, setPayoutStatus] =
    useState('all')
  const [payouts, setPayouts] = useState([])
  const [payoutSummary, setPayoutSummary] =
    useState({})
  const [payoutLoading, setPayoutLoading] =
    useState(false)
  const [payoutActionId, setPayoutActionId] =
    useState('')
  const [selectedPayout, setSelectedPayout] = useState(null)
  const awaitingReceiptRows = useMemo(() => payouts.filter((payout) => payout.status === 'awaiting_receipt'), [payouts])
  const awaitingReceiptCount = payoutSummary.awaiting_receipt_count ?? awaitingReceiptRows.length
  const awaitingReceiptUsd = payoutSummary.awaiting_receipt_usd ?? awaitingReceiptRows.reduce((total, payout) => total + (Number(payout.net_payout_usd) || 0), 0)

  const summary = data?.summary || {}
  const sources = data?.sources || []
  const withdrawals = data?.withdrawals || {}
  const authorStore = findSource(
    sources,
    'author_store'
  )
  const sortedSources = useMemo(() => {
    const direction =
      sortDirection === 'asc' ? 1 : -1

    return [...sources].sort((a, b) => {
      const first =
        sourceSortValue(a, sortField)
      const second =
        sourceSortValue(b, sortField)

      if (first !== second) {
        return (first - second) * direction
      }

      return sourceName(a.source).localeCompare(
        sourceName(b.source)
      )
    })
  }, [sources, sortField, sortDirection])

  const mainCards = useMemo(
    () => [
      {
        label: 'Net Platform Income',
        value: formatUsd(
          summary.net_platform_income_usd
        ),
        sub: 'Real admin income after current rules',
        primary: true,
      },
      {
        label: 'Gross Sales',
        value: formatUsd(
          summary.gross_sales_usd
        ),
        sub: 'Across all tracked income sources',
      },
      {
        label: 'Pending Author Payout',
        value: formatUsd(
          summary.pending_payout_usd
        ),
        sub: 'Author money not counted as platform income',
      },
    ],
    [summary]
  )

  const miniCards = useMemo(
    () => [
      {
        label: 'Shadow Mall',
        value: formatUsd(
          summary.shadow_mall_income_usd
        ),
        sub: `Shipping excluded: ${formatUsd(
          summary.shipping_fee_excluded_usd
        )}`,
      },
      {
        label: 'Author Page Platform',
        value: formatUsd(
          summary.author_store_income_usd
        ),
        sub: `Stored platform fee · ${authorStore.order_count || 0} paid records`,
      },
      {
        label: 'Episode Author Payout',
        value: formatUsd(
          summary.episode_author_payout_usd
        ),
        sub: 'Episode reading earnings',
      },
      {
        label: 'Diamond Gift Payout',
        value: formatUsd(
          summary.diamond_gift_author_payout_usd
        ),
        sub: 'Actual stored author payout',
      },
      {
        label: 'Diamond Gift Platform',
        value: formatUsd(
          summary.diamond_gift_platform_income_usd
        ),
        sub: 'Actual stored platform income',
      },
    ],
    [summary, authorStore.order_count]
  )

  async function fetchIncome(
    rangeOverride = null
  ) {
    try {
      setLoading(true)
      setMessage('')

      const params = new URLSearchParams()
      const activeFrom =
        rangeOverride?.from ?? from
      const activeTo =
        rangeOverride?.to ?? to

      if (activeFrom) {
        params.set('from', activeFrom)
      }
      if (activeTo) {
        params.set('to', activeTo)
      }

      const url =
  `${API_URL}/api/admin/income/summary?${params.toString()}`

const result =
  await requestIncomeSummary(
    url,
    authHeaders()
  )

setData(result)
    } catch (error) {
      setMessage(
        error.message ||
          'Failed to load income summary'
      )
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPayouts() {
    try {
      setPayoutLoading(true)
      setMessage('')

      const params = new URLSearchParams()

      if (payoutMonth) {
        params.set('month', payoutMonth)
      }

      if (payoutStatus !== 'all') {
        params.set('status', payoutStatus)
      }

      const response = await fetch(
        `${API_URL}/api/admin/income/payouts?${params.toString()}`,
        {
          headers: authHeaders(),
        }
      )

      const result =
        await response.json().catch(() => ({}))

      if (!response.ok || result.ok === false) {
        throw new Error(
          result.message ||
            'Failed to load author payouts'
        )
      }

      setPayouts(result.payouts || [])
      setPayoutSummary(result.summary || {})
    } catch (error) {
      setMessage(
        error.message ||
          'Failed to load author payouts'
      )
      setPayouts([])
      setPayoutSummary({})
    } finally {
      setPayoutLoading(false)
    }
  }

  async function generatePayouts() {
    if (!PAYOUT_WORKFLOW_READY || !payoutMonth) return

    const confirmed = window.confirm(
      `Generate or refresh author payouts for ${payoutMonth}?`
    )

    if (!confirmed) return

    try {
      setPayoutActionId('generate')
      setMessage('')
      setSuccess('')

      const response = await fetch(
        `${API_URL}/api/admin/income/payouts/generate`,
        {
          method: 'POST',
          headers: authHeaders(true),
          body: JSON.stringify({
            payout_month: payoutMonth,
          }),
        }
      )

      const result =
        await response.json().catch(() => ({}))

      if (!response.ok || result.ok === false) {
        throw new Error(
          result.message ||
            'Failed to generate payouts'
        )
      }

      setSuccess(
        `Payouts for ${payoutMonth} generated successfully.`
      )

      await Promise.all([
        fetchPayouts(),
        fetchIncome(),
      ])
    } catch (error) {
      setMessage(
        error.message ||
          'Failed to generate payouts'
      )
    } finally {
      setPayoutActionId('')
    }
  }

  function openPayoutTransfer(payout) {
    if (!PAYOUT_WORKFLOW_READY || !['scheduled', 'awaiting_receipt'].includes(payout.status)) return
    setMessage('')
    setSuccess('')
    setSelectedPayout(payout)
  }

  function handleRangeChange(event) {
    const nextKey = event.target.value
    setRangeKey(nextKey)

    if (nextKey === 'custom') return

    const nextRange =
      getIncomePresetRange(nextKey)
    setFrom(nextRange.from)
    setTo(nextRange.to)
    fetchIncome(nextRange)
  }

  function toggleSortDirection() {
    setSortDirection((current) =>
      current === 'desc' ? 'asc' : 'desc'
    )
  }

  async function handleIncomeRefresh() {
    let nextRange =
      getIncomePresetRange(rangeKey)

    if (rangeKey === 'custom') {
      if (!customFrom || !customTo) {
        setMessage(
          'Choose both custom start and end date & time.'
        )
        return
      }

      const nextFrom =
        customBoundary(customFrom)
      const nextTo =
        customBoundary(customTo)

      if (
        new Date(nextFrom).getTime() >=
        new Date(nextTo).getTime()
      ) {
        setMessage(
          'Custom start date must be before end date.'
        )
        return
      }

      nextRange = {
        from: nextFrom,
        to: nextTo,
      }
    }

    setFrom(nextRange.from)
    setTo(nextRange.to)
    await fetchIncome(nextRange)
  }

  async function refreshAll() {
    setSuccess('')
    await Promise.all([
      fetchIncome(),
      fetchPayouts(),
    ])
  }

  useEffect(() => {
    refreshAll()
  }, [])

  return (
    <AdminLayout
      title="Income"
      subtitle="Finance & Growth"
    >
      <style>{styles}</style>
      <AdminStoryPayoutConfirmModal
        payout={selectedPayout}
        apiUrl={API_URL}
        authHeaders={authHeaders}
        authorName={payoutAuthorName}
        formatUsd={formatUsd}
        onClose={() => {
          setSelectedPayout(null)
          fetchPayouts()
        }}
        onRecorded={(payoutId, transferReference) => {
          if (payoutId) {
            setSelectedPayout((current) => current?.id === payoutId ? {
              ...current,
              status: 'awaiting_receipt',
              transfer_reference: current.transfer_reference || transferReference,
              transfer_recorded_at: current.transfer_recorded_at || new Date().toISOString(),
            } : current)
          }
          fetchPayouts()
        }}
        onPaid={async () => {
          setSelectedPayout(null)
          setSuccess('Payout recorded with receipt.')
          await Promise.all([fetchPayouts(), fetchIncome()])
        }}
      />

      <div className="income-page">
        <div className="income-wrap">
          <section className="income-hero">
            <div className="income-hero-top">
              <div>
                <div className="income-kicker">
                  Professional Finance View
                </div>
                <h1 className="income-title">
                  Income Overview
                </h1>
                <div className="income-subtitle">
                  Platform income, author earnings,
                  Diamond Gifts, payouts, and shipping
                  are tracked separately.
                </div>
              </div>

              <div className="income-filter">
                <select
                  className="income-select"
                  value={rangeKey}
                  onChange={handleRangeChange}
                  aria-label="Income time range"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Date & Time</option>
                </select>

                <select
                  className="income-select"
                  value={sortField}
                  onChange={(event) =>
                    setSortField(event.target.value)
                  }
                  aria-label="Sort income sources by"
                >
                  <option value="platform_income">Platform Income</option>
                  <option value="gross_sales">Gross Sales</option>
                  <option value="author_earnings">Author Earnings</option>
                  <option value="pending_payout">Pending Payout</option>
                  <option value="records">Records</option>
                </select>

                <button
                  className={`income-reverse ${
                    sortDirection === 'asc'
                      ? 'is-asc'
                      : ''
                  }`}
                  type="button"
                  onClick={toggleSortDirection}
                  aria-label={
                    sortDirection === 'desc'
                      ? 'Reverse to low to high'
                      : 'Reverse to top to low'
                  }
                  aria-pressed={
                    sortDirection === 'asc'
                  }
                  title={
                    sortDirection === 'desc'
                      ? 'Top → Low'
                      : 'Low → Top'
                  }
                >
                  <ReverseIcon />
                </button>

                <button
                  className="income-button"
                  type="button"
                  onClick={handleIncomeRefresh}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>

                {rangeKey === 'custom' ? (
                  <div className="income-custom-range">
                    <input
                      className="income-input"
                      type="datetime-local"
                      value={customFrom}
                      max={customTo || undefined}
                      onChange={(event) =>
                        setCustomFrom(
                          event.target.value
                        )
                      }
                      aria-label="Custom start date"
                    />
                    <span className="income-range-arrow">
                      →
                    </span>
                    <input
                      className="income-input"
                      type="datetime-local"
                      value={customTo}
                      min={customFrom || undefined}
                      onChange={(event) =>
                        setCustomTo(
                          event.target.value
                        )
                      }
                      aria-label="Custom end date"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="income-rule-strip">
              <div className="income-rule">
                <div className="income-rule-label">
                  Episode Sales
                </div>
                <div className="income-rule-value">
                  Reading revenue rules
                </div>
              </div>
              <div className="income-rule">
                <div className="income-rule-label">
                  Diamond Gifts
                </div>
                <div className="income-rule-value">
                  Stored author/platform split
                </div>
              </div>
              <div className="income-rule">
                <div className="income-rule-label">
                  Author Page
                </div>
                <div className="income-rule-value">
                  Stored fee/income split
                </div>
              </div>
              <div className="income-rule">
                <div className="income-rule-label">
                  Shadow Mall
                </div>
                <div className="income-rule-value">
                  Product sales · Shipping excluded
                </div>
              </div>
            </div>
          </section>

          {message ? (
            <div className="income-message">
              {message}
            </div>
          ) : null}

          {success ? (
            <div className="income-message income-success">
              {success}
            </div>
          ) : null}

          {loading ? (
            <div className="income-panel">
              <div className="income-empty">
                Loading income...
              </div>
            </div>
          ) : (
            <>
              <section className="income-main-grid">
                {mainCards.map((card) => (
                  <div
                    className={`income-main-card ${
                      card.primary ? 'primary' : ''
                    }`}
                    key={card.label}
                  >
                    <div className="income-card-label">
                      {card.label}
                    </div>
                    <div className="income-card-value">
                      {card.value}
                    </div>
                    <div className="income-card-sub">
                      {card.sub}
                    </div>
                  </div>
                ))}
              </section>

              <section className="income-mini-grid">
                {miniCards.map((card) => (
                  <div
                    className="income-mini-card"
                    key={card.label}
                  >
                    <div className="income-card-label">
                      {card.label}
                    </div>
                    <div className="income-mini-value">
                      {card.value}
                    </div>
                    <div className="income-card-sub">
                      {card.sub}
                    </div>
                  </div>
                ))}
              </section>

              <section className="income-panel">
                <div className="income-panel-head">
                  <div className="income-panel-title">
                    Source Breakdown
                  </div>
                  <div className="income-pill">
                    {sources.length} sources
                  </div>
                </div>

                {sources.length === 0 ? (
                  <div className="income-empty">
                    No source data found.
                  </div>
                ) : (
                  <div className="income-table-wrap">
                    <table className="income-table">
                      <thead>
                        <tr>
                          <th>Source</th>
                          <th>Gross</th>
                          <th>Platform Income</th>
                          <th>Author Earnings</th>
                          <th>Pending Payout</th>
                          <th>Records</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedSources.map((source) => (
                        <tr
  key={source.source}
  onClick={() => {
    if (source.source === 'episode_sales') navigate('/income/episode-sales')
    if (source.source === 'diamond_gifts') navigate('/income/diamond-gifts')
    if (source.source === 'author_store') navigate('/income/author-page')
    if (source.source === 'shadow_mall') navigate('/income/shadow-mall')
  }}
  style={{ cursor: ['episode_sales', 'diamond_gifts', 'author_store', 'shadow_mall'].includes(source.source) ? 'pointer' : 'default' }}
>
                            <td>
                              <div className="income-source-name">
                                {sourceName(
                                  source.source
                                )}
                              </div>
                              <div className="income-small">
                                {source.source ===
                                'shadow_mall'
                                  ? `Shipping excluded: ${formatUsd(
                                      source.shipping_fee_usd
                                    )}`
                                  : source.source ===
                                      'diamond_gifts'
                                    ? 'Stored author/platform split'
                                    : source.source ===
                                        'episode_sales'
                                      ? 'Stored reading revenue split'
                                      : 'Stored platform fee and author income'}
                              </div>
                            </td>
                            <td>
                              <div className="income-money">
                                {formatUsd(
                                  source.gross_sales_usd
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="income-money">
                                {formatUsd(
                                  source.platform_income_usd
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="income-money">
                                {formatUsd(
                                  source.author_earnings_usd
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="income-money">
                                {formatUsd(
                                  source.pending_payout_usd
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="income-money">
                                {source.gift_transaction_count ||
                                  source.order_count ||
                                  0}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="income-panel">
                <div className="income-panel-head">
                  <div>
                    <div className="income-panel-title">
                      Author Payout Management
                    </div>
                    <div className="income-small">
                      Story Unlock Only · Minimum $10
                    </div>
                  </div>

                  <div className="income-payout-tools">
                    <input
                      className="income-payout-field"
                      type="month"
                      value={payoutMonth}
                      onChange={(event) =>
                        setPayoutMonth(
                          event.target.value
                        )
                      }
                    />
                    <select
                      className="income-payout-field"
                      value={payoutStatus}
                      onChange={(event) =>
                        setPayoutStatus(
                          event.target.value
                        )
                      }
                    >
                      <option value="all">
                        All status
                      </option>
                      <option value="scheduled">
                        Scheduled
                      </option>
                        <option value="awaiting_receipt">
                          Awaiting Receipt
                        </option>
                      <option value="paid">
                        Paid
                      </option>
                      <option value="missing_payment_method">
                        Missing Payment
                      </option>
                      <option value="failed">
                        Failed
                      </option>
                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>
                    <button
                      type="button"
                      className="income-payout-button secondary"
                      onClick={fetchPayouts}
                      disabled={payoutLoading}
                    >
                      Filter
                    </button>
                    <button
                      type="button"
                      className="income-payout-button"
                      onClick={generatePayouts}
                      disabled={
                        !PAYOUT_WORKFLOW_READY || payoutActionId === 'generate'
                      }
                    >
                      {payoutActionId ===
                      'generate'
                        ? 'Generating...'
                        : PAYOUT_WORKFLOW_READY ? 'Generate Payout' : 'Generate paused'}
                    </button>
                  </div>
                </div>

                <div className="income-payout-warning" role="status">
                  {PAYOUT_WORKFLOW_READY
                    ? 'A recorded transfer must never be sent again. Upload its receipt and complete the existing payout instead.'
                    : 'Payout generation and transfer actions are paused until the backend and receipt workflow are verified. Do not send money or mark payouts paid from this page.'}
                </div>

                <div className="income-payout-summary">
                  <div className="income-withdraw-item">
                    <div className="income-card-label">
                      Total
                    </div>
                    <div className="income-mini-value">
                      {formatUsd(
                        payoutSummary.total_usd
                      )}
                    </div>
                    <div className="income-small">
                      {payoutSummary.total_count ||
                        0}{' '}
                      payouts
                    </div>
                  </div>
                  <div className="income-withdraw-item">
                    <div className="income-card-label">
                      Scheduled
                    </div>
                    <div className="income-mini-value">
                      {formatUsd(
                        payoutSummary.scheduled_usd
                      )}
                    </div>
                    <div className="income-small">
                      {payoutSummary.scheduled_count ||
                        0}{' '}
                      ready
                    </div>
                  </div>
                  <div className="income-withdraw-item">
                    <div className="income-card-label">Awaiting Receipt</div>
                    <div className="income-mini-value">{formatUsd(awaitingReceiptUsd)}</div>
                    <div className="income-small">{awaitingReceiptCount} transfers awaiting receipt</div>
                  </div>
                  <div className="income-withdraw-item">
                    <div className="income-card-label">
                      Paid
                    </div>
                    <div className="income-mini-value">
                      {formatUsd(
                        payoutSummary.paid_usd
                      )}
                    </div>
                    <div className="income-small">
                      {payoutSummary.paid_count || 0}{' '}
                      paid
                    </div>
                  </div>
                  <div className="income-withdraw-item">
                    <div className="income-card-label">
                      Missing Payment
                    </div>
                    <div className="income-mini-value">
                      {formatUsd(
                        payoutSummary.missing_payment_method_usd
                      )}
                    </div>
                    <div className="income-small">
                      {payoutSummary.missing_payment_method_count ||
                        0}{' '}
                      authors
                    </div>
                  </div>
                </div>

                {payoutLoading ? (
                  <div className="income-empty">
                    Loading payouts...
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="income-empty">
                    No payouts found for this filter.
                  </div>
                ) : (
                  <div className="income-table-wrap">
                    <table className="income-table">
                      <thead>
                        <tr>
                          <th>Author</th>
                          <th>Month</th>
                          <th>Gross</th>
                          <th>Net Payout</th>
                          <th>Payment</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payouts.map((payout) => (
                          <tr key={payout.id}>
                            <td>
                              <div className="income-source-name">
                                {payoutAuthorName(
                                  payout
                                )}
                              </div>
                              <div className="income-small">
                                {payout.author_user
                                  ?.email || ''}
                              </div>
                            </td>
                            <td>
                              <div className="income-money">
                                {payout.payout_month}
                              </div>
                            </td>
                            <td>
                              <div className="income-money">
                                {formatUsd(
                                  payout.gross_usd
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="income-money">
                                {formatUsd(
                                  payout.net_payout_usd
                                )}
                              </div>
                              {Number(
                                payout.withholding_amount_usd ||
                                  0
                              ) > 0 ? (
                                <div className="income-small">
                                  Withholding{' '}
                                  {formatUsd(
                                    payout.withholding_amount_usd
                                  )}
                                </div>
                              ) : null}
                            </td>
                            <td>
                              <div className="income-source-name">
                                {payoutPaymentText(
                                  payout
                                )}
                              </div>
                              <div className="income-small">
                                {payout
                                  ?.payment_method_snapshot
                                  ?.account_name ||
                                  payout
                                    ?.payment_method_snapshot
                                    ?.paypal_email ||
                                  payout
                                    ?.payment_method_snapshot
                                    ?.phone_number ||
                                  ''}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`income-status ${payout.status}`}
                              >
                                {String(payout.status || '').replace(/_/g, ' ')}
                              </span>
                              {payout.status === 'awaiting_receipt' && payout.transfer_recorded_at ? (
                                <div className="income-small">Transfer recorded: {new Date(payout.transfer_recorded_at).toLocaleString()}</div>
                              ) : null}
                              {payout.status === 'awaiting_receipt' && payout.transfer_reference ? (
                                <div className="income-small">Reference: {payout.transfer_reference}</div>
                              ) : null}
                            </td>
                            <td>
                              {payout.status === 'scheduled' || payout.status === 'awaiting_receipt' ? (
                                <div>
                                  {payout.status === 'awaiting_receipt' ? (
                                    <div className="income-small">Transfer recorded — do not transfer again. Upload the receipt for this payout.</div>
                                  ) : null}
                                  <button
                                    type="button"
                                    className="income-payout-button paid"
                                    onClick={() => openPayoutTransfer(payout)}
                                    disabled={!PAYOUT_WORKFLOW_READY || payoutActionId === payout.id}
                                  >
                                    {!PAYOUT_WORKFLOW_READY
                                      ? 'Receipt workflow pending'
                                      : payoutActionId === payout.id
                                        ? 'Saving...'
                                        : payout.status === 'awaiting_receipt'
                                          ? 'Upload receipt'
                                          : 'Transfer / record receipt'}
                                  </button>
                                </div>
                              ) : (
                                <span className="income-small">
                                  {payout.status === 'paid'
                                    ? 'Completed'
                                    : payout.status === 'missing_payment_method'
                                      ? 'Author must add payment method'
                                      : '-'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="income-panel">
                <div className="income-panel-head">
                  <div className="income-panel-title">
                    Author Store Withdraw Snapshot
                  </div>
                  <div className="income-pill">
                    {withdrawals.request_count || 0}{' '}
                    requests
                  </div>
                </div>

                <div className="income-withdraw-grid">
                  <div className="income-withdraw-item">
                    <div className="income-card-label">
                      In Review
                    </div>
                    <div className="income-mini-value">
                      {formatUsd(
                        withdrawals.in_review_usd
                      )}
                    </div>
                  </div>
                  <div className="income-withdraw-item">
                    <div className="income-card-label">
                      Approved
                    </div>
                    <div className="income-mini-value">
                      {formatUsd(
                        withdrawals.approved_usd
                      )}
                    </div>
                  </div>
                  <div className="income-withdraw-item">
                    <div className="income-card-label">
                      Paid
                    </div>
                    <div className="income-mini-value">
                      {formatUsd(
                        withdrawals.paid_usd
                      )}
                    </div>
                  </div>
                  <div className="income-withdraw-item">
                    <div className="income-card-label">
                      Rejected
                    </div>
                    <div className="income-mini-value">
                      {formatUsd(
                        withdrawals.rejected_usd
                      )}
                    </div>
                  </div>
                  <button
                    className="income-withdraw-action"
                    type="button"
                    onClick={() =>
                      navigate('/withdraw')
                    }
                  >
                    Open Withdraw
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
