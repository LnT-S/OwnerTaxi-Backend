import express from 'express'
const router = express.Router()

import authentication from './authentication/index.js'
import customer from './customer/index.js'
import { vehicleInfo } from '../controllers/GenericController.js'

router.get('/',(req,res)=>{
    res.render('server_running.ejs',{
        title : 'Owner Taxi Server'
    })
})

router.use('/authentication' , authentication)
router.use('/customer' , customer)

//VEHICLE INFO
router.get('/vehicle-info',vehicleInfo)


export default router