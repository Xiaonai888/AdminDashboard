import express from 'express'
import multer from 'multer'
import os from 'node:os'
import { unlink } from 'node:fs/promises'
import { requireAdminPermission } from '../middleware/adminPermission.middleware.js'
import { guardDiskBackedUploads } from '../middleware/globalMediaUploadGuard.middleware.js'
import {
  listStickers,
  createStickerFolder, updateStickerFolder, deleteStickerFolder,
  uploadStickerCover, deleteStickerCover,
  createStickerImage, updateStickerImage, deleteStickerImage,
} from '../controllers/adminStickerLibrary.controller.js'

const router = express.Router()
const coverUpload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, done) {
    if (new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']).has(file.mimetype)) {
      done(null, true)
    } else {
      done(Object.assign(new Error('Only JPEG, PNG, WebP, GIF or AVIF images are allowed'), { statusCode: 400 }))
    }
  },
})
function coverHandler(req, res, next) {
  coverUpload.single('cover')(req, res, (error) => {
    if (error) {
      if (req.file?.path) unlink(req.file.path).catch(() => {})
      return res.status(error.statusCode || 400).json({ ok: false,
        message: error.code === 'LIMIT_FILE_SIZE' ? 'Folder cover must be 5 MB or smaller' : error.message })
    }
    next()
  })
}
function cleanupCover(req, res, next) {
  if (req.file?.path) {
    let cleaned = false
    const cleanup = () => { if (!cleaned) { cleaned = true; unlink(req.file.path).catch(() => {}) } }
    res.once('finish', cleanup)
    res.once('close', cleanup)
  }
  next()
}
const canView = requireAdminPermission('media_library.view')
const canManage = requireAdminPermission('media_library.manage')
router.get('/', canView, listStickers)
router.post('/folders', canManage, createStickerFolder)
router.patch('/folders/:folderId', canManage, updateStickerFolder)
router.post('/folders/:folderId/cover', canManage, coverHandler, cleanupCover, guardDiskBackedUploads, uploadStickerCover)
router.delete('/folders/:folderId/cover', canManage, deleteStickerCover)
router.delete('/folders/:folderId', canManage, deleteStickerFolder)
router.post('/images', canManage, createStickerImage)
router.patch('/images/:imageId', canManage, updateStickerImage)
router.delete('/images/:imageId', canManage, deleteStickerImage)
export default router
