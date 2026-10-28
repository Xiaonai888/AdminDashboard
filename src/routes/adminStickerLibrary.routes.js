import express from 'express'
import multer from 'multer'
import os from 'node:os'
import { randomBytes } from 'node:crypto'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { requireAdminPermission } from '../middleware/adminPermission.middleware.js'
import { guardDiskBackedUploads } from '../middleware/globalMediaUploadGuard.middleware.js'
import {
  listStickers,
  createStickerFolder, updateStickerFolder, deleteStickerFolder,
  uploadStickerCover, deleteStickerCover,
  createStickerImage, updateStickerImage, deleteStickerImage,
} from '../controllers/adminStickerLibrary.controller.js'

const router = express.Router()
const coverTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const coverTemporaryDir = os.tmpdir()

// Only server-generated paths are tracked for cleanup. Never unlink req.file.path.
const coverPaths = new WeakMap()
const coverUpload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, callback) {
      callback(null, coverTemporaryDir)
    },
    filename(req, _file, callback) {
      const name = randomBytes(16).toString('hex')
      coverPaths.set(req, join(coverTemporaryDir, name))
      callback(null, name)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, done) {
    if (coverTypes.has(file.mimetype)) return done(null, true)
    return done(Object.assign(new Error('Only JPEG, PNG, WebP, GIF or AVIF images are allowed'), { statusCode: 400 }))
  },
})

async function removeTemporaryCover(req) {
  const serverGeneratedPath = coverPaths.get(req)
  coverPaths.delete(req)
  if (serverGeneratedPath) await unlink(serverGeneratedPath).catch(() => {})
}

function coverHandler(req, res, next) {
  coverUpload.single('cover')(req, res, (error) => {
    if (error) {
      void removeTemporaryCover(req)
      return res.status(error.statusCode || 400).json({
        ok: false,
        message: error.code === 'LIMIT_FILE_SIZE'
          ? 'Folder cover must be 5 MB or smaller'
          : error.message || 'Invalid folder cover',
      })
    }
    if (!req.file) {
      void removeTemporaryCover(req)
      return res.status(400).json({ ok: false, message: 'Choose a folder cover image' })
    }
    // Register cleanup before the following middleware and controller run.
    res.once('finish', () => { void removeTemporaryCover(req) })
    res.once('close', () => { void removeTemporaryCover(req) })
    next()
  })
}

const canView = requireAdminPermission('media_library.view')
const canManage = requireAdminPermission('media_library.manage')
router.get('/', canView, listStickers)
router.post('/folders', canManage, createStickerFolder)
router.patch('/folders/:folderId', canManage, updateStickerFolder)
router.post('/folders/:folderId/cover', canManage, coverHandler, guardDiskBackedUploads, uploadStickerCover)
router.delete('/folders/:folderId/cover', canManage, deleteStickerCover)
router.delete('/folders/:folderId', canManage, deleteStickerFolder)
router.post('/images', canManage, createStickerImage)
router.patch('/images/:imageId', canManage, updateStickerImage)
router.delete('/images/:imageId', canManage, deleteStickerImage)
export default router
