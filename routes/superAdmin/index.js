import express from 'express'
import { addDocumentList, getAllUserDocInfo, getPaymentsInfo, setDocumentStatus, setPaymentStatus, verifyDrivers } from '../../controllers/SuperAdminController.js'
const router = express.Router()

router.post('/add-document-to-list',addDocumentList)
router.get('/get-all-user-doc-info',getAllUserDocInfo)
router.post('/set-doc-status',setDocumentStatus)
router.get('/get-payment-info',getPaymentsInfo)
router.post('/set-payment-info',setPaymentStatus)
router.post('/verify-drivers',verifyDrivers)

export default router