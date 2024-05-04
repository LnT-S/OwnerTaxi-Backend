import express from 'express'
import { getIntercityBookingFromCustomer } from '../../controllers/VendorController.js'

const router = express.Router()

router.get('/get-intercity-bookings-post-customer',getIntercityBookingFromCustomer) 

export default router