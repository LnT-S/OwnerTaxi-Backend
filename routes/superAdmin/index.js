import express from 'express'
import { addDocumentList } from '../../controllers/SuperAdminController.js'
const router = express.Router()

router.post('/add-document-to-list',addDocumentList)

export default router