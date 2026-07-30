import React, { useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

async function saveFolderSortOrder(folder) {
  const token = getAdminToken()
  const response = await fetch(
    `${API_URL}/api/admin/media-library/folders/${folder.id}`,
    {
      method: 'PATCH',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sort_order: folder.sortOrder }),
    }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || 'Failed to save folder order')
  }

  return data.folder
}

function reorderFolders(folders, draggedId, targetId, placeAfter) {
  const sourceIndex = folders.findIndex((folder) => folder.id === draggedId)
  const targetIndex = folders.findIndex((folder) => folder.id === targetId)

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return folders
  }

  const next = [...folders]
  const [moved] = next.splice(sourceIndex, 1)
  const adjustedTargetIndex = next.findIndex((folder) => folder.id === targetId)
  const insertIndex = placeAfter ? adjustedTargetIndex + 1 : adjustedTargetIndex

  next.splice(insertIndex, 0, moved)

  return next.map((folder, index) => ({
    ...folder,
    sortOrder: index + 1,
  }))
}

export default function SortableMediaFolderList({
  folders,
  images,
  selectedFolderId,
  onSelect,
  onEdit,
  onToggle,
  onDelete,
  onReordered,
}) {
  const [draggedFolderId, setDraggedFolderId] = useState('')
  const [dropTarget, setDropTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const orderedFolders = useMemo(
    () => [...folders].sort((a, b) => a.sortOrder - b.sortOrder),
    [folders]
  )

  async function handleDrop(event, targetId) {
    event.preventDefault()

    if (!draggedFolderId || draggedFolderId === targetId || saving) {
      setDraggedFolderId('')
      setDropTarget(null)
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const placeAfter = event.clientY > rect.top + rect.height / 2
    const previousFolders = orderedFolders
    const nextFolders = reorderFolders(
      orderedFolders,
      draggedFolderId,
      targetId,
      placeAfter
    )

    setDraggedFolderId('')
    setDropTarget(null)

    if (nextFolders === previousFolders) return

    onReordered(nextFolders)
    setSaving(true)

    try {
      const changedFolders = nextFolders.filter((folder) => {
        const previous = previousFolders.find((item) => item.id === folder.id)
        return previous?.sortOrder !== folder.sortOrder
      })

      await Promise.all(changedFolders.map(saveFolderSortOrder))
    } catch (error) {
      onReordered(previousFolders)
      window.alert(error.message || 'Failed to save folder order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="media-folder-list media-sortable-folder-list">
      <style>{`
        .media-sortable-folder-list {
          position: relative;
        }

        .media-folder-order-status {
          margin: 0 4px 4px;
          color: #4F46E5;
          font-size: 10px;
          font-weight: 850;
        }

        .media-sortable-folder-item {
          position: relative;
          border-radius: 15px;
          transition: opacity 150ms ease, transform 150ms ease;
        }

        .media-sortable-folder-item.dragging {
          opacity: 0.45;
        }

        .media-sortable-folder-item.drop-before::before,
        .media-sortable-folder-item.drop-after::after {
          position: absolute;
          right: 4px;
          left: 4px;
          z-index: 3;
          height: 3px;
          border-radius: 999px;
          background: #4F46E5;
          content: '';
        }

        .media-sortable-folder-item.drop-before::before {
          top: -5px;
        }

        .media-sortable-folder-item.drop-after::after {
          bottom: -5px;
        }

        .media-folder-drag-handle {
          position: absolute;
          top: 16px;
          right: 10px;
          z-index: 4;
          display: flex;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.92);
          color: #64748B;
          font: inherit;
          font-size: 17px;
          font-weight: 900;
          cursor: grab;
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.1);
          touch-action: none;
        }

        .media-folder-drag-handle:active {
          cursor: grabbing;
        }

        .media-folder-drag-handle:disabled {
          cursor: wait;
          opacity: 0.5;
        }

        .media-sortable-folder-item .media-folder {
          padding-right: 44px;
        }
      `}</style>

      {saving ? (
        <div className="media-folder-order-status">Saving folder order...</div>
      ) : null}

      {orderedFolders.map((folder) => {
        const targetClass =
          dropTarget?.id === folder.id
            ? dropTarget.placeAfter
              ? 'drop-after'
              : 'drop-before'
            : ''

        return (
          <div
            key={folder.id}
            className={`media-sortable-folder-item ${
              draggedFolderId === folder.id ? 'dragging' : ''
            } ${targetClass}`}
            onDragOver={(event) => {
              event.preventDefault()
              if (!draggedFolderId || draggedFolderId === folder.id) return

              const rect = event.currentTarget.getBoundingClientRect()
              setDropTarget({
                id: folder.id,
                placeAfter: event.clientY > rect.top + rect.height / 2,
              })
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setDropTarget((current) =>
                  current?.id === folder.id ? null : current
                )
              }
            }}
            onDrop={(event) => handleDrop(event, folder.id)}
          >
            <button
              type="button"
              className="media-folder-drag-handle"
              draggable={!saving}
              disabled={saving}
              aria-label={`Move ${folder.name}`}
              title="Drag to move folder"
              onClick={(event) => event.stopPropagation()}
              onDragStart={(event) => {
                setDraggedFolderId(folder.id)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', folder.id)
              }}
              onDragEnd={() => {
                setDraggedFolderId('')
                setDropTarget(null)
              }}
            >
              ⋮⋮
            </button>

            <button
              type="button"
              className={`media-folder ${
                selectedFolderId === folder.id ? 'active' : ''
              }`}
              onClick={() => onSelect(folder.id)}
            >
              <div className="media-folder-card-layout">
                <div className="media-folder-cover">
                  {folder.coverPreview || folder.coverUrl ? (
                    <img
                      src={folder.coverPreview || folder.coverUrl}
                      alt={folder.name}
                    />
                  ) : (
                    <span>{folder.icon}</span>
                  )}
                </div>

                <div className="media-folder-card-copy">
                  <div className="media-folder-top">
                    <span className="media-folder-name">{folder.name}</span>
                    <span className="media-folder-order">
                      #{folder.sortOrder}
                    </span>
                  </div>

                  <div className="media-folder-description">
                    {folder.description || 'No description'}
                  </div>

                  <div className="media-folder-count">
                    {
                      images.filter(
                        (image) => image.folderId === folder.id
                      ).length
                    }{' '}
                    images
                  </div>
                </div>
              </div>
            </button>

            <div className="media-folder-actions">
              <button type="button" onClick={() => onEdit(folder)}>
                Edit
              </button>
              <button type="button" onClick={() => onToggle(folder)}>
                {folder.active ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => onDelete(folder.id)}
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
