import express from 'express'
import { booking } from '../../controllers/CustomerController.js'

const router = express.Router()

router.post('/booking',booking)

export default router