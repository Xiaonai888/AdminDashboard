import React, { useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const tabs = [
  { key: 'words', label: 'Block Words' },
  { key: 'readers', label: 'Readers' },
  { key: 'authors', label: 'Authors' },
  { key: 'author_pages', label: 'Author Pages' },
  { key: 'stories', label: 'Stories' },
]

const styles = `
  .block-list-page { max-width: 1200px; margin: 0 auto; }
  .block-list-head { margin-bottom: 18px; }
  .block-list-title { margin: 0; font-size: 28px; font-weight: 950; letter-spacing: -0.04em; color: #0F172A; }
  .block-list-subtitle { margin-top: 8px; color: #64748B; font-size: 14px; font-weight: 600; line-height: 1.6; }
  .block-list-tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
  .block-list-tab { border: 1px solid #E2E8F0; background: #FFFFFF; color: #64748B; height: 40px; padding: 0 15px; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 900; cursor: pointer; }
  .block-list-tab.active { background: #4F46E5; border-color: #4F46E5; color: #FFFFFF; }
  .block-list-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 22px; box-shadow: 0 8px 28px rgba(15, 23, 42, 0.05); overflow: hidden; }
  .block-list-card-head { padding: 20px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
  .block-list-card-title { margin: 0; font-size: 17px; font-weight: 950; color: #0F172A; }
  .block-list-card-desc { margin-top: 5px; color: #64748B; font-size: 12px; font-weight: 700; line-height: 1.5; }
  .block-list-add-btn { height: 40px; border: 0; border-radius: 13px; background: #4F46E5; color: #FFFFFF; padding: 0 16px; font: inherit; font-size: 13px; font-weight: 950; cursor: pointer; }
  .block-list-empty { padding: 44px 20px; text-align: center; color: #64748B; font-size: 13px; font-weight: 700; line-height: 1.7; }
`

export default function AdminBlockListPage() {
  const [activeTab, setActiveTab] = useState('words')

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label || 'Block List'

  return (
    <AdminLayout title="Block List" subtitle="Manage blocked words and future account/story restrictions.">
      <style>{styles}</style>

      <div className="block-list-page">
        <div className="block-list-head">
          <h1 className="block-list-title">Block List</h1>
          <div className="block-list-subtitle">
            Start with Block Words first. Other block sections are prepared as empty tabs for later.
          </div>
        </div>

        <div className="block-list-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`block-list-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="block-list-card">
          <div className="block-list-card-head">
            <div>
              <h2 className="block-list-card-title">{activeLabel}</h2>
              <div className="block-list-card-desc">
                {activeTab === 'words'
                  ? 'Add and manage restricted words. Full add/edit/delete function will connect in the next stage.'
                  : 'This tab is ready. We will build it later.'}
              </div>
            </div>

            {activeTab === 'words' ? (
              <button type="button" className="block-list-add-btn">
                Add Block Word
              </button>
            ) : null}
          </div>

          <div className="block-list-empty">
            {activeTab === 'words'
              ? 'Block Words page is now visible. Next stage will connect it to the backend API.'
              : 'Coming soon.'}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
