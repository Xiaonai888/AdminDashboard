import React, { useMemo, useState } from 'react';
import { adminPageSearchItems } from './AdminPageSearchIndex';
const searchStyles = `
  .admin-sidebar-search-wrap {
    position: relative;
    margin: 0 2px 8px;
  }

  .admin-sidebar-search-box {
    width: 100%;
    height: 40px;
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid #E2E8F0;
    border-radius: 11px;
    background: #F8FAFC;
    overflow: hidden;
    transition: width 0.25s ease, border-color 0.2s ease, background 0.2s ease;
  }

  .admin-sidebar-search-box:focus-within {
    border-color: #818CF8;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.10);
  }

  .admin-sidebar-search-icon {
    width: 18px;
    height: 18px;
    position: absolute;
    left: 11px;
    flex-shrink: 0;
    color: #64748B;
    pointer-events: none;
  }

  .admin-sidebar-search-input {
    width: 100%;
    height: 100%;
    border: 0;
    outline: 0;
    padding: 0 10px 0 38px;
    background: transparent;
    color: #0F172A;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    transition: opacity 0.2s ease;
  }

  .admin-sidebar-search-input::placeholder {
    color: #94A3B8;
  }

  .admin-sidebar-search-results {
    margin-top: 6px;
    padding: 5px;
    border: 1px solid #E2E8F0;
    border-radius: 11px;
    background: #FFFFFF;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.10);
  }

  .admin-sidebar-search-result {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 9px 10px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #334155;
    text-align: left;
    cursor: pointer;
  }

  .admin-sidebar-search-result:hover {
    background: #EEF2FF;
    color: #4F46E5;
  }

  .admin-sidebar-search-result-label {
    font-size: 13px;
    font-weight: 700;
  }

  .admin-sidebar-search-result-section {
    color: #94A3B8;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .admin-sidebar-search-empty {
    padding: 10px;
    color: #94A3B8;
    font-size: 12px;
    text-align: center;
  }

  .admin-main-sidebar:not(:hover) .admin-sidebar-search-box {
    width: 40px;
    margin-left: 4px;
  }

  .admin-main-sidebar:not(:hover) .admin-sidebar-search-input,
  .admin-main-sidebar:not(:hover) .admin-sidebar-search-results {
    opacity: 0;
    pointer-events: none;
  }

  @media (max-width: 760px) {
    .admin-main-sidebar.open .admin-sidebar-search-box {
      width: 100%;
      margin-left: 0;
    }

    .admin-main-sidebar.open .admin-sidebar-search-input,
    .admin-main-sidebar.open .admin-sidebar-search-results {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const extraSearchItems = [
  { path: '/reader-online', label: 'Reader Online', section: 'Content' },
  { path: '/admin/settings', label: 'Admin Settings', section: 'System' },
  { path: '/admin/change-password', label: 'Change Password', section: 'System' },
];

export default function AdminSidebarSearch({ sections, onNavigate }) {
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
  const merged = new Map();
  [...sections.flatMap(section => section.items.map(item => ({ ...item, section: section.label }))), ...extraSearchItems, ...adminPageSearchItems].forEach(item => {
    const current = merged.get(item.path) || {};
    merged.set(item.path, { ...item, ...current, searchText: `${current.searchText || ''} ${item.searchText || ''}` });
  });
  return [...merged.values()];
}, [sections]);

  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? items
        .filter(item => `${item.section} ${item.label} ${item.searchText || ''}`.toLowerCase().includes(normalizedQuery))
        .slice(0, 8)
    : [];

  const openResult = path => {
    setQuery('');
    onNavigate(path);
  };

  return (
    <>
      <style>{searchStyles}</style>
      <div className="admin-sidebar-search-wrap">
        <div className="admin-sidebar-search-box">
          <svg
            className="admin-sidebar-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            className="admin-sidebar-search-input"
            type="search"
            value={query}
            placeholder="Search Admin..."
            aria-label="Search Admin"
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && results[0]) openResult(results[0].path);
            }}
          />
        </div>

        {normalizedQuery && (
          <div className="admin-sidebar-search-results">
            {results.length > 0 ? (
              results.map(item => (
                <button
                  key={item.path}
                  type="button"
                  className="admin-sidebar-search-result"
                  onClick={() => openResult(item.path)}
                >
                  <span className="admin-sidebar-search-result-label">{item.label}</span>
                  <span className="admin-sidebar-search-result-section">{item.section}</span>
                </button>
              ))
            ) : (
              <div className="admin-sidebar-search-empty">No results found</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
