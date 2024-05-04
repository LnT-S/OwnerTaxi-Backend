import express from 'express'
import passport from 'passport'
const router = express.Router()

import authentication from './authentication/index.js'
import customer from './customer/index.js'
import driver from './driver/index.js'
import vendor from './vendor/index.js'
import { vehicleInfo } from '../controllers/GenericController.js'

router.get('/',(req,res)=>{
    res.render('server_running.ejs',{
        title : 'Owner Taxi Server'
    })
})

router.use('/authentication' , authentication)
router.use('/customer',passport.authenticate('jwt',{session : false}) , customer)
router.use('/driver',passport.authenticate('jwt',{session : false}) , driver)
router.use('/vendor',passport.authenticate('jwt',{session : false}) , vendor)

//VEHICLE INFO
router.get('/vehicle-info',vehicleInfo)


export default router