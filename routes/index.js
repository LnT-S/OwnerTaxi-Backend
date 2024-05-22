import express from 'express'
import passport from 'passport'
import axios from 'axios'
const router = express.Router()
import dotenv from 'dotenv'
dotenv.config()

import authentication from './authentication/index.js'
import customer from './customer/index.js'
import driver from './driver/index.js'
import vendor from './vendor/index.js'
import superadmin from './superAdmin/index.js'
import { vehicleInfo } from '../controllers/GenericController.js'
import { jwtAuthMiddleware } from '../middlewares/jwtAuthCheck.js'
import { sendNotification } from '../services/notification.js'
import Authentication from '../models/Authentication.js'

router.get('/', (req, res) => {
    res.render('server_running.ejs', {
        title: 'Owner Taxi Server'
    })
})
router.get('/jwt-check', jwtAuthMiddleware, (req, res) => {

    return res.status(200).json({
        message: "You are a verified User",
        data: req.user
    })
})
router.post('/push-notification', async (req, res) => {
    try {
        let notiUser = await Authentication.aggregate([
            {
              $group: {
                _id: null,
                sId: {
                  $push: "$subscriptionId"
                }
              }
            }
          ])
        console.log("RESPONSE IN TRY",notiUser[0].sId);
        const notification = {
            app_id: process.env.ONESIGNAL_APP_ID,
            headings : { en: "New Booking Posted" },
            contents: { en: "New Booking has been posted from Sitapur TO Jaipur" },
            isAndroid: true,
            include_subscription_ids:notiUser[0].sId ,
            // existing_android_channel_id : '6c3e7417-f4e9-4186-982f-b7edaa60e035',
            android_channel_id : '85f617fa-d257-47de-968e-4f032ea21579'
        };
        
        // let response  = sendNotification('85f617fa-d257-47de-968e-4f032ea21579',['3e267dde-acfd-43a5-abc0-6f3bbe85eb09'])
        const response = await axios.post('https://api.onesignal.com/notifications', notification, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${process.env.ONESIGNAL_APP_KEY}`
            }
        })
        
        return res.status(200).json({
            message: "RESPONSE FROM NNOTIFICAION",
            data: response.data
        })
    } catch (error) {
        console.log("ERROR CALLING NOTIFICATION data -----", error);
        return res.status(500).json({
            messgae: "Internal Server Error"
        })
    }
})
router.use('/authentication', authentication)
router.use('/customer', passport.authenticate('jwt', { session: false }), customer)
router.use('/driver', passport.authenticate('jwt', { session: false }), driver)
router.use('/vendor', passport.authenticate('jwt', { session: false }), vendor)
router.use('/superadmin', passport.authenticate('jwt', { session: false }), superadmin)

//VEHICLE INFO
router.get('/vehicle-info', vehicleInfo)


export default router