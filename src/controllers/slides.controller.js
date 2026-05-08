import { supabase } from '../config/supabase.js'

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media'
const LOG_RETENTION_DAYS = 30

function toBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return fallback
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function getActor(req) {
  return req.get('x-admin-actor') || req.body?.admin_actor || req.query?.admin_actor || 'Admin'
}

function cleanupDateIso() {
  const date = new Date()
  date.setDate(date.getDate() - LOG_RETENTION_DAYS)
  return date.toISOString()
}

async function cleanupOldLogs() {
  try {
    await supabase.from('admin_activity_logs').delete().lt('created_at', cleanupDateIso())
  } catch (error) {
    console.warn('CLEANUP OLD LOGS WARNING:', error.message)
  }
}

async function createActivityLog({ action, actor, slide, details = {} }) {
  try {
    await cleanupOldLogs()
    await supabase.from('admin_activity_logs').insert({
      entity: 'slides',
      action,
      actor: actor || 'Admin',
      slide_id: slide?.id || null,
      order_index: slide?.order_index ?? null,
      title: slide?.title || '',
      details,
    })
  } catch (error) {
    console.warn('CREATE ACTIVITY LOG WARNING:', error.message)
  }
}

async function uploadImage(file) {
  if (!file) return null
  const originalName = file.originalname || 'slide-image'
  const fileExt = originalName.includes('.') ? originalName.split('.').pop() : 'jpg'
  const safeExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const fileName = `slides/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file.buffer, {
    contentType: file.mimetype,
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return publicUrlData.publicUrl
}

export async function getSlides(req, res) {
  try {
    const sectionKey = req.query.section_key || 'home_top_slider'
    const includeInactive = req.query.include_inactive === 'true'

    let query = supabase
      .from('slides')
      .select('*')
      .eq('section_key', sectionKey)
      .order('order_index', { ascending: true })
      .order('updated_at', { ascending: false })

    if (!includeInactive) query = query.eq('is_active', true)

    const { data, error } = await query
    if (error) throw error
    res.status(200).json({ ok: true, slides: data })
  } catch (error) {
    console.error('GET SLIDES ERROR:', error)
    res.status(500).json({ ok: false, message: 'Failed to fetch slides' })
  }
}

export async function createSlide(req, res) {
  try {
    const actor = getActor(req)
    const { section_key = 'home_top_slider', title = '', subtitle = '', link_url = '', order_index = 0, is_active = 'true' } = req.body
    if (!req.file) return res.status(400).json({ ok: false, message: 'Slide image is required. Use form field name: image' })
    const imageUrl = await uploadImage(req.file)

    const { data, error } = await supabase.from('slides').insert({
      section_key,
      title,
      subtitle,
      image_url: imageUrl,
      link_url,
      order_index: toNumber(order_index),
      is_active: toBoolean(is_active),
    }).select().single()
    if (error) throw error

    await createActivityLog({ action: 'CREATE', actor, slide: data, details: { message: `Created Slide ${data.order_index}`, link_url: data.link_url, is_active: data.is_active } })
    res.status(201).json({ ok: true, slide: data })
  } catch (error) {
    console.error('CREATE SLIDE ERROR:', error)
    res.status(500).json({ ok: false, message: 'Failed to create slide' })
  }
}

export async function updateSlide(req, res) {
  try {
    const actor = getActor(req)
    const { id } = req.params
    const updatePayload = { updated_at: new Date().toISOString() }
    const allowedFields = ['section_key', 'title', 'subtitle', 'link_url']

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updatePayload[field] = req.body[field]
    }
    if (req.body.order_index !== undefined) updatePayload.order_index = toNumber(req.body.order_index)
    if (req.body.is_active !== undefined) updatePayload.is_active = toBoolean(req.body.is_active)
    if (req.file) updatePayload.image_url = await uploadImage(req.file)

    const { data, error } = await supabase.from('slides').update(updatePayload).eq('id', id).select().single()
    if (error) throw error

    const isVisibilityOnly = Object.keys(updatePayload).length <= 2 && updatePayload.is_active !== undefined
    await createActivityLog({
      action: isVisibilityOnly ? 'VISIBILITY' : 'UPDATE',
      actor,
      slide: data,
      details: {
        message: isVisibilityOnly ? `Changed Slide ${data.order_index} visibility` : `Updated Slide ${data.order_index}`,
        changed_fields: Object.keys(updatePayload),
        link_url: data.link_url,
        is_active: data.is_active,
        image_replaced: Boolean(req.file),
      },
    })

    res.status(200).json({ ok: true, slide: data })
  } catch (error) {
    console.error('UPDATE SLIDE ERROR:', error)
    res.status(500).json({ ok: false, message: 'Failed to update slide' })
  }
}

export async function deleteSlide(req, res) {
  try {
    const actor = getActor(req)
    const { id } = req.params
    const { data, error } = await supabase.from('slides').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw error
    await createActivityLog({ action: 'DELETE', actor, slide: data, details: { message: `Deleted / hidden Slide ${data.order_index}`, soft_delete: true } })
    res.status(200).json({ ok: true, slide: data })
  } catch (error) {
    console.error('DELETE SLIDE ERROR:', error)
    res.status(500).json({ ok: false, message: 'Failed to delete slide' })
  }
}

export async function getSlideActivityLogs(req, res) {
  try {
    await cleanupOldLogs()
    const page = Math.max(toNumber(req.query.page, 1), 1)
    const limit = Math.min(Math.max(toNumber(req.query.limit, 20), 1), 50)
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('admin_activity_logs')
      .select('*', { count: 'exact' })
      .eq('entity', 'slides')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    res.status(200).json({ ok: true, logs: data || [], page, limit, total: count || 0, totalPages: Math.max(Math.ceil((count || 0) / limit), 1) })
  } catch (error) {
    console.error('GET SLIDE ACTIVITY LOGS ERROR:', error)
    res.status(500).json({ ok: false, message: 'Failed to fetch slide records' })
  }
}
