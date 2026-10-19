import { useCallback, useRef, useState } from 'react'

const EMPTY_DRAFT = { settings: {}, items: [], moves: [] }

function readDraft(key) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null')
    if (!saved || typeof saved !== 'object') return EMPTY_DRAFT
    return {
      settings: saved.settings && !Array.isArray(saved.settings) && typeof saved.settings === 'object' ? saved.settings : {},
      items: Array.isArray(saved.items) ? saved.items.slice(0, 100) : [],
      moves: Array.isArray(saved.moves) ? saved.moves.slice(0, 200) : [],
    }
  } catch {
    return EMPTY_DRAFT
  }
}

export function applyAdvertisementDraft(items, draft, firstOrder = null) {
  const source = Array.isArray(items) ? items : []
  const patches = new Map((draft?.items || []).map(item => [Number(item.id), item]))
  const next = source.map(item => ({ ...item, ...(patches.get(Number(item.id)) || {}) }))
  let reordered = false

  for (const move of draft?.moves || []) {
    const sourceIndex = next.findIndex(item => Number(item.id) === Number(move.item_id))
    if (sourceIndex < 0) continue
    let targetIndex = sourceIndex
    if (move.target_item_id != null) {
      targetIndex = next.findIndex(item => Number(item.id) === Number(move.target_item_id))
    } else if (move.direction === 'up') {
      targetIndex = sourceIndex - 1
    } else if (move.direction === 'down') {
      targetIndex = sourceIndex + 1
    }
    if (targetIndex < 0 || targetIndex >= next.length || targetIndex === sourceIndex) continue
    const [selected] = next.splice(sourceIndex, 1)
    next.splice(targetIndex, 0, selected)
    reordered = true
  }

  if (!reordered || firstOrder == null) return next
  return next.map((item, index) => ({ ...item, sort_order: firstOrder + index }))
}

export default function useAdvertisementDraft(apiPrefix) {
  const placement = apiPrefix.includes('/opening-rotation') ? 'opening' : apiPrefix.split('/').filter(Boolean).pop()
  const storageKey = `shadow_advertisement_draft_${placement}`
  const [draft, setDraft] = useState(() => readDraft(storageKey))
  const draftRef = useRef(draft)

  const update = useCallback(next => {
    draftRef.current = next
    setDraft(next)
    try {
      if (Object.keys(next.settings).length || next.items.length || next.moves.length) {
        sessionStorage.setItem(storageKey, JSON.stringify(next))
      } else {
        sessionStorage.removeItem(storageKey)
      }
    } catch {
      return next
    }
    return next
  }, [storageKey])

  const stageSettings = useCallback(changes => {
    update({ ...draftRef.current, settings: { ...draftRef.current.settings, ...changes } })
  }, [update])

  const stageItem = useCallback((id, changes) => {
    const numericId = Number(id)
    if (!Number.isSafeInteger(numericId) || numericId < 1) return false
    const oldItems = draftRef.current.items
    const previous = oldItems.find(item => Number(item.id) === numericId) || { id: numericId }
    const items = [...oldItems.filter(item => Number(item.id) !== numericId), { ...previous, ...changes, id: numericId }]
    if (items.length > 100) return false
    update({ ...draftRef.current, items })
    return true
  }, [update])

  const stageMove = useCallback((id, payload) => {
    const numericId = Number(id)
    if (!Number.isSafeInteger(numericId) || numericId < 1 || draftRef.current.moves.length >= 200) return false
    const move = { item_id: numericId }
    if (payload.target_item_id != null) {
      const target = Number(payload.target_item_id)
      if (!Number.isSafeInteger(target) || target < 1 || target === numericId) return false
      move.target_item_id = target
    } else if (payload.direction === 'up' || payload.direction === 'down') {
      move.direction = payload.direction
    } else {
      return false
    }
    update({ ...draftRef.current, moves: [...draftRef.current.moves, move] })
    return true
  }, [update])

  const clearDraft = useCallback(() => update(EMPTY_DRAFT), [update])
  const getDraft = useCallback(() => draftRef.current, [])
  const preview = useCallback((items, firstOrder = null) => applyAdvertisementDraft(items, draftRef.current, firstOrder), [])
  const hasChanges = Object.keys(draft.settings).length > 0 || draft.items.length > 0 || draft.moves.length > 0

  return { placement, draft, hasChanges, stageSettings, stageItem, stageMove, clearDraft, getDraft, preview }
}
