import Authentication from '../models/Authentication.js'
import PassiveBooking from '../models/PassiveBooking.js'
import ActiveBooking from "../models/ActiveBooking.js"
import path from 'path'
import * as fs from 'fs'
const __dirname = path.resolve(path.dirname(''));

export const booking = async (req, res) => {
    console.log('API : /customer/booking \n', req.body)
    try {
        let previousBooking = await PassiveBooking.find({ id: req.user._id })
        if (previousBooking.length >= 3) {
            console.log("BOOKING LIMIT REACHED")
            return res.status(400).json({
                message: 'Your booking limit has been reached !'
            })
        }
        let psvBooking = await PassiveBooking.create({ id: req.user._id, ...req.body, status: "pending" })
        await ActiveBooking.create({ authenticationId: req.user._id, passiveBookingId: psvBooking._id })
        return res.status(200).json({
            message: 'Your booking has been confirmed !'
        })
    } catch (error) {
        console.log('ERROR CREATING BOOKING')
        return res.status(400).json({
            message: 'Internal Server Error'
        })
    }
}

export const activeBookingInfo = async (req, res) => {
    console.log('API : /customer/active-booking-info \n', req.user)
    try {
        let data = await ActiveBooking.find({ authenticationId: req.user._id }).populate('passiveBookingId').select('passiveBookingId')
        console.log(data)
        return res.status(200).json({
            message: 'Active Booking For ' + req.user.phoneNo,
            data
        })
    } catch (error) {
        console.log("error in finding user active booking ", error)
        return res.status(400).json({
            message: 'Iternal Server Error'
        })
    }

}

export const getProfileInfo = async (req, res) => {
    console.log('API : /customer/get-profile-info \n', req.user)
    return res.status(200).json({
        message: `PROFILE FOR ${req.user.phoneNo}`,
        data: req.user
    })
}

export const editProfileInfo = async (req, res) => {
    console.log("API : /customer/edit-profile");
    try {
        Authentication.uploadImage(req, res, async function (err) {
            if (err) {
                console.log("MULTER ERRROR ", err);
                return res.status(400).json({
                    message: 'INTERNAL SERVER ERROR'
                })
            }
            console.log("FILES \n", req.file);
            const { name, email } = req.body
            console.log("NAME , EMAIL ",name,email);
            let user = await  Authentication.findById(req.user._id)
            if (name && name !== user.name) {
                user.name = name
            }
            if (email && email !== user.email) {
                user.email = email
            }
            if (req.file && user.avatar !== '' && user.avatar !== undefined) {
                console.log("AVATAR 0", user?.avatar)
                fs.unlinkSync(path.join(__dirname, user?.avatar))
            }
            if(req.file){

                user.avatar = path.join(Authentication.avatarPath, req?.file?.filename)
            }
            console.log("FINAL USER ",user)
            await user.save()
            Authentication.findByIdAndUpdate(user._id, user , {new : true })
                .then(upUser => {
                    console.log("UPDATED PROFILE ", upUser)
                    return res.status(200).json({
                        message: 'User Profile Updated Successfully',
                        data: upUser
                    })
                })
                .catch(err => {
                    console.log("ERROR UPDATING PROFILE ", err)
                    return res.status(400).json({
                        message: 'Internal Server Error',
                    })
                })
                
            })
        } catch (error) {
            console.log("ERROR IN EDIT PROFILE ", error);
            return res.status(400).json({
                message: 'Internal Server Error',
            })
    }
}