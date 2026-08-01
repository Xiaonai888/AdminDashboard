import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://shadow-backend-kucw.onrender.com'

const SECTION_TABS = [
  { key: 'all', label: 'All' },
  { key: 'featured', label: 'Featured' },
  { key: 'new_exclusive', label: 'New Exclusive' },
  { key: 'popular_exclusive', label: 'Popular' },
  { key: 'editor_pick', label: 'Editor Pick' },
  { key: 'premium_romance', label: 'Romance' },
  { key: 'premium_fantasy', label: 'Fantasy' },
  { key: 'completed_exclusive', label: 'Completed' },
]

const TYPE_FILTERS = [
  { key: 'all', label: 'All Types' },
  { key: 'novel', label: 'Novel' },
  { key: 'manga', label: 'Manga' },
  { key: 'chat_story', label: 'Chat Story' },
]

function getReaderToken() {
  return (
    localStorage.getItem('shadow_reader_token') ||
    sessionStorage.getItem('shadow_reader_token') ||
    ''
  )
}

function formatCompactNumber(value) {
  const number = Number(value || 0)

  if (!Number.isFinite(number)) return '0'
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}M`
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`
  }

  return String(number)
}

function normalizeStoryType(value) {
  const type = String(value || 'novel').trim().toLowerCase()

  if (type === 'manga') return 'Manga'
  if (type === 'chat_story') return 'Chat Story'

  return 'Novel'
}

function getStorySections(story) {
  return Array.isArray(story?.exclusive_sections)
    ? story.exclusive_sections.map((item) => String(item || '').trim()).filter(Boolean)
    : []
}

function matchesSection(story, section) {
  if (section === 'all') return true

  const sections = getStorySections(story)

  if (sections.includes(section)) return true

  if (
    section === 'completed_exclusive' &&
    String(story.story_status || '').trim().toLowerCase() === 'completed'
  ) {
    return true
  }

  if (
    section === 'premium_romance' &&
    String(story.main_genre || '').trim().toLowerCase() === 'romance'
  ) {
    return true
  }

  if (
    section === 'premium_fantasy' &&
    String(story.main_genre || '').trim().toLowerCase() === 'fantasy'
  ) {
    return true
  }

  return false
}

function StoryCover({ story }) {
  const [failed, setFailed] = useState(false)

  if (!story.cover_url || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#111827] via-[#312e81] to-[#6d28d9] px-4 text-center text-[12px] font-black leading-5 text-white">
        {story.title || 'Shadow Exclusive'}
      </div>
    )
  }

  return (
    <img
      src={story.cover_url}
      alt={story.title || 'Story cover'}
      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function StoryCard({ story }) {
  const sections = getStorySections(story)
  const primarySection = sections[0]
  const isCompleted =
    String(story.story_status || '').trim().toLowerCase() === 'completed'

  return (
    <Link to={`/story/${story.id}`} className="group block min-w-0">
      <article className="min-w-0">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[18px] bg-[#111827] shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
          <StoryCover story={story} />

          <div className="absolute left-2 top-2 flex max-w-[calc(100%-16px)] flex-wrap gap-1.5">
            <span className="rounded-full bg-[#111827]/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#facc15] backdrop-blur">
              Exclusive
            </span>

            {story.is_adult ? (
              <span className="rounded-full bg-[#dc2626]/90 px-2 py-1 text-[9px] font-black text-white backdrop-blur">
                18+
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
            <span className="min-w-0 truncate rounded-full bg-white/92 px-2.5 py-1 text-[9px] font-extrabold text-[#312e81] backdrop-blur">
              {primarySection
                ? primarySection.replace(/_/g, ' ')
                : story.main_genre || 'Premium'}
            </span>

            {isCompleted ? (
              <span className="shrink-0 rounded-full bg-[#22c55e]/92 px-2 py-1 text-[9px] font-black text-white backdrop-blur">
                END
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 min-w-0">
          <h2 className="line-clamp-2 text-[15px] font-black leading-[1.35] tracking-[-0.01em] text-[#111827]">
            {story.title || 'Untitled Story'}
          </h2>

          <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-[#7c8391]">
            <span className="truncate">{story.main_genre || 'Story'}</span>
            <span>•</span>
            <span className="shrink-0">{normalizeStoryType(story.story_type)}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-[#6b7280]">
            <span className="inline-flex items-center gap-1">
              <i className="fa-regular fa-eye text-[10px]" />
              {formatCompactNumber(story.total_views)}
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="fa-regular fa-heart text-[10px]" />
              {formatCompactNumber(story.total_likes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="fa-solid fa-list text-[9px]" />
              {formatCompactNumber(story.total_episodes)} EP
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index}>
          <div className="aspect-[2/3] animate-pulse rounded-[18px] bg-[#e5e7eb]" />
          <div className="mt-3 h-4 animate-pulse rounded-full bg-[#e5e7eb]" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-[#eef0f3]" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ hasFilters, onReset, onRefresh }) {
  return (
    <div className="rounded-[24px] border border-[#e5e7eb] bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f0ff] text-[25px] text-[#6d28d9]">
        <i className="fa-solid fa-crown" />
      </div>

      <h2 className="mt-5 text-[18px] font-black text-[#111827]">
        {hasFilters ? 'No matching exclusive stories' : 'No exclusive stories yet'}
      </h2>

      <p className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6 text-[#7c8391]">
        {hasFilters
          ? 'Try another section, story type, or search word.'
          : 'Approved Shadow Exclusive stories will appear here automatically.'}
      </p>

      <button
        type="button"
        onClick={hasFilters ? onReset : onRefresh}
        className="mt-5 rounded-full bg-[#111827] px-6 py-3 text-[13px] font-black text-white active:scale-[0.98]"
      >
        {hasFilters ? 'Reset Filters' : 'Refresh'}
      </button>
    </div>
  )
}

export default function ShadowExclusivePage() {
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [activeSection, setActiveSection] = useState('all')
  const [storyType, setStoryType] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  async function loadStories(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      setError('')

      const token = getReaderToken()
      const response = await fetch(
        `${API_BASE_URL}/api/public/shadow-exclusive/stories?limit=100&sort=${encodeURIComponent(sort)}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load Shadow Exclusive stories')
      }

      setStories(Array.isArray(data.stories) ? data.stories : [])
    } catch (requestError) {
      setStories([])
      setError(
        requestError.message === 'Failed to fetch'
          ? 'Cannot connect to the server right now.'
          : requestError.message || 'Failed to load Shadow Exclusive stories'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStories()
  }, [sort])

  const sectionCounts = useMemo(() => {
    return SECTION_TABS.reduce((result, section) => {
      result[section.key] = stories.filter((story) =>
        matchesSection(story, section.key)
      ).length
      return result
    }, {})
  }, [stories])

  const filteredStories = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()

    const filtered = stories.filter((story) => {
      if (!matchesSection(story, activeSection)) return false

      if (
        storyType !== 'all' &&
        String(story.story_type || 'novel').trim().toLowerCase() !== storyType
      ) {
        return false
      }

      if (!cleanSearch) return true

      const searchableText = [
        story.title,
        story.main_genre,
        story.description,
        ...(Array.isArray(story.tags) ? story.tags : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(cleanSearch)
    })

    if (sort === 'popular') {
      return [...filtered].sort(
        (first, second) =>
          Number(second.total_views || 0) - Number(first.total_views || 0)
      )
    }

    if (sort === 'updated') {
      return [...filtered].sort(
        (first, second) =>
          new Date(second.updated_at || 0).getTime() -
          new Date(first.updated_at || 0).getTime()
      )
    }

    return filtered
  }, [activeSection, search, sort, stories, storyType])

  const hasFilters =
    activeSection !== 'all' || storyType !== 'all' || Boolean(search.trim())

  const resetFilters = () => {
    setActiveSection('all')
    setStoryType('all')
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-[#f7f7fa] pb-28 text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#111827] active:bg-black/5"
            aria-label="Go back"
          >
            <i className="fa-solid fa-chevron-left text-[17px]" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-black tracking-[-0.02em]">
              Shadow Exclusive
            </h1>
            <p className="truncate text-[11px] font-semibold text-[#8b91a0]">
              Premium stories selected by Shadow
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadStories(true)}
            disabled={refreshing}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#5b6472] active:bg-black/5 disabled:opacity-50"
            aria-label="Refresh"
          >
            <i
              className={`fa-solid fa-rotate-right text-[15px] ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>
      </header>

      <section className="overflow-hidden bg-[#111827] text-white">
        <div className="relative mx-auto w-full max-w-[1440px] px-5 py-9 sm:px-8 sm:py-12">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#7c3aed]/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-[18%] h-52 w-52 rounded-full bg-[#facc15]/15 blur-3xl" />

          <div className="relative max-w-[720px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#facc15]/30 bg-[#facc15]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#fde047]">
              <i className="fa-solid fa-crown" />
              Premium Collection
            </div>

            <h2 className="mt-4 text-[28px] font-black leading-[1.08] tracking-[-0.04em] sm:text-[42px]">
              Stories chosen to stand apart.
            </h2>

            <p className="mt-3 max-w-[620px] text-[13px] font-medium leading-6 text-white/70 sm:text-[15px]">
              Discover approved Shadow Exclusive novels, manga, and chat stories in one collection.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold text-white/85">
                {formatCompactNumber(stories.length)} Exclusive Stories
              </span>
              <span className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold text-white/85">
                Real-time Collection
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7">
        <div className="rounded-[22px] border border-black/5 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTION_TABS.map((section) => {
              const active = activeSection === section.key

              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-[12px] font-extrabold transition ${
                    active
                      ? 'border-[#111827] bg-[#111827] text-white'
                      : 'border-[#e5e7eb] bg-white text-[#596170]'
                  }`}
                >
                  {section.label}
                  <span
                    className={`ml-1.5 ${
                      active ? 'text-white/65' : 'text-[#a1a7b2]'
                    }`}
                  >
                    {formatCompactNumber(sectionCounts[section.key])}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="flex h-11 min-w-0 items-center gap-2 rounded-[13px] bg-[#f3f4f6] px-3.5">
              <i className="fa-solid fa-magnifying-glass text-[13px] text-[#9ca3af]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search exclusive stories..."
                className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold outline-none placeholder:text-[#a1a7b2]"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#8b91a0] active:bg-black/5"
                  aria-label="Clear search"
                >
                  <i className="fa-solid fa-xmark text-[12px]" />
                </button>
              ) : null}
            </label>

            <select
              value={storyType}
              onChange={(event) => setStoryType(event.target.value)}
              className="h-11 rounded-[13px] border border-[#e5e7eb] bg-white px-3.5 text-[12px] font-extrabold text-[#4b5563] outline-none"
            >
              {TYPE_FILTERS.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-[13px] border border-[#e5e7eb] bg-white px-3.5 text-[12px] font-extrabold text-[#4b5563] outline-none"
            >
              <option value="latest">Latest</option>
              <option value="updated">Recently Updated</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>

        <div className="mb-4 mt-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-black tracking-[-0.02em]">
              {SECTION_TABS.find((section) => section.key === activeSection)?.label ||
                'All'}{' '}
              Stories
            </h2>
            <p className="mt-1 text-[12px] font-semibold text-[#8b91a0]">
              {formatCompactNumber(filteredStories.length)} results
            </p>
          </div>

          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-[11px] font-extrabold text-[#596170]"
            >
              Reset
            </button>
          ) : null}
        </div>

        {error ? (
          <div className="mb-5 rounded-[18px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-circle-exclamation mt-0.5 text-[#dc2626]" />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-black text-[#991b1b]">
                  Could not load Shadow Exclusive
                </div>
                <div className="mt-1 text-[12px] font-semibold leading-5 text-[#b91c1c]">
                  {error}
                </div>
              </div>
              <button
                type="button"
                onClick={() => loadStories()}
                className="shrink-0 rounded-full bg-[#dc2626] px-3 py-2 text-[10px] font-black text-white"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <LoadingGrid />
        ) : filteredStories.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <EmptyState
            hasFilters={hasFilters}
            onReset={resetFilters}
            onRefresh={() => loadStories()}
          />
        )}
      </main>
    </div>
  )
}
