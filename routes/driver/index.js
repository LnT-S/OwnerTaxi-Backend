import express from 'express'
import { addVehicle, booking, getDocumentInfo, getIntercityBookingFromPostVendor, getLocalBooking, uploadDocument } from '../../controllers/DriverController.js'
const router = express.Router()

router.get('/get-local-bookings',getLocalBooking) 
router.get('/get-intercity-bookings-post-vendor',getIntercityBookingFromPostVendor) 
router.post('/booking',booking)
router.post('/add-vehicle',addVehicle)
router.get('/get-document-info',getDocumentInfo)
router.post('/upload-document',uploadDocument)

export default router