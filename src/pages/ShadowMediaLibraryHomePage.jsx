import React from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const LIBRARIES = [
  {
    id: 'character',
    title: 'Character',
    description: 'Manage the existing character media library, folders and images.',
    path: '/media-library/character',
    icon: 'fa-regular fa-images',
  },
  {
    id: 'sticker',
    title: 'Sticker',
    description: 'Manage stickers, folders and editable animation settings.',
    path: '/media-library/sticker',
    icon: 'fa-regular fa-face-smile',
    isNew: true,
  },
]

export default function ShadowMediaLibraryHomePage() {
  const navigate = useNavigate()

  return (
    <AdminLayout
      title="Shadow Media Library"
      subtitle="Choose a media library to manage."
    >
      <style>{`
        .shadow-media-home {
          width: min(100%, 1100px);
          margin: 0 auto;
          padding: 18px 0 32px;
        }
        .shadow-media-home-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .shadow-media-home-card {
          width: 100%;
          min-height: 240px;
          padding: 26px;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: #fff;
          color: #0f172a;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          transition: box-shadow .18s ease, border-color .18s ease, transform .18s ease;
        }
        .shadow-media-home-card:hover {
          border-color: #a5b4fc;
          box-shadow: 0 14px 38px rgba(15, 23, 42, .08);
          transform: translateY(-2px);
        }
        .shadow-media-home-card:focus-visible {
          outline: 3px solid #818cf8;
          outline-offset: 3px;
        }
        .shadow-media-home-icon {
          display: grid;
          place-items: center;
          width: 64px;
          height: 64px;
          border-radius: 19px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 26px;
        }
        .shadow-media-home-card[data-library="sticker"] .shadow-media-home-icon {
          background: #f5f3ff;
          color: #7c3aed;
        }
        .shadow-media-home-title {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 22px;
          font-weight: 850;
        }
        .shadow-media-home-new {
          border-radius: 999px;
          background: #ede9fe;
          color: #6d28d9;
          padding: 4px 9px;
          font-size: 11px;
          font-weight: 800;
        }
        .shadow-media-home-description {
          max-width: 400px;
          color: #64748b;
          line-height: 1.6;
          font-size: 14px;
        }
        .shadow-media-home-open {
          margin-top: auto;
          color: #4f46e5;
          font-size: 13px;
          font-weight: 800;
        }
        @media (max-width: 700px) {
          .shadow-media-home-grid { grid-template-columns: 1fr; }
          .shadow-media-home-card { min-height: 200px; padding: 22px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .shadow-media-home-card { transition: none; }
          .shadow-media-home-card:hover { transform: none; }
        }
      `}</style>

      <main className="shadow-media-home">
        <div className="shadow-media-home-grid">
          {LIBRARIES.map((library) => (
            <button
              key={library.id}
              type="button"
              className="shadow-media-home-card"
              data-library={library.id}
              onClick={() => navigate(library.path)}
              aria-label={`Open ${library.title} media library`}
            >
              <span className="shadow-media-home-icon" aria-hidden="true">
                <i className={library.icon} />
              </span>
              <span className="shadow-media-home-title">
                {library.title}
                {library.isNew && <span className="shadow-media-home-new">New</span>}
              </span>
              <span className="shadow-media-home-description">{library.description}</span>
              <span className="shadow-media-home-open" aria-hidden="true">
                Open library ›
              </span>
            </button>
          ))}
        </div>
      </main>
    </AdminLayout>
  )
}
