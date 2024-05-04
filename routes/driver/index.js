import express from 'express'
import { booking, getIntercityBookingFromPostVendor, getLocalBooking } from '../../controllers/DriverController.js'
const router = express.Router()

router.get('/get-local-bookings',getLocalBooking) 
router.get('/get-intercity-bookings-post-vendor',getIntercityBookingFromPostVendor) 
router.post('/booking',booking)
export default router