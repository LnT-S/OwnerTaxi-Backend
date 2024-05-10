import otplib from "otplib";
import { setGlobalDispatcher, Agent } from 'undici'
import axios from 'axios';
const saltRounds = 10;

import Authentication from '../models/Authentication.js'
import PassiveBooking from "../models/PassiveBooking.js";
import ActiveBooking from "../models/ActiveBooking.js";
import jwt from "jsonwebtoken";
import Requirement from "../models/Requirement.js";
import mongoose from "mongoose";
import dotenv from 'dotenv'

export const getOtp = async function (req, res) {
    console.log('API :  /authentication/get-otp', req.body)
    const phoneNo = req.body.phone
    const type = req.body.type.toLowerCase()
    const OTP = otplib.authenticator.generate(phoneNo)

    const API_KEY = process.env.SMS_ROOT_API_KEY
    const contacts = phoneNo
    const template_id = process.env.TEMPLATE_ID;
    const sms_text = `Your OTP is ${OTP} for Owner Taxi login, Do not share with anyone. Regards Owner Taxi`;

    setGlobalDispatcher(new Agent({ connect: { timeout: 60000 } }))

    let URL = `https://bulksms.smsroot.com/app/smsapi/index.php?key=${API_KEY}&campaign=0&contacts=${contacts}&senderid=OwnerT&msg=Your OTP is ${OTP} for Owner Taxi login, Do not share with anyone. Regards Owner Taxi"&routeid=13&template_id=${template_id}`;

    try {
        let user = await Authentication.findOne({ phoneNo })
        let docs = []
        let temp;
        if (!user) {
            if (type === 'driver') {
                let requiredArray = await Requirement.aggregate([
                    // Deconstruct the array field
                    { $unwind: "$documentsList" },
                    // Match documents where field1 is 'aman'
                    { $match: { "documentsList.documentFor": "Driver" } },
                    // Group by field1 and count occurrences
                    {
                        $group: {
                            _id: null,
                            vehicleDocuments: { $push: "$documentsList" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            vehicleDocuments: {
                                $map: {
                                    input: "$vehicleDocuments",
                                    as: "obj",
                                    in: { documentFor: "$$obj.documentFor", documentName: "$$obj.documentName" } // Exclude _id field
                                }
                            }
                        }
                    }
                ]);

                requiredArray[0]?.vehicleDocuments?.forEach(ele => {
                    temp = { ...ele, status: 'Missing', image: '', documentNo: '' }
                    docs.push(temp)
                })
                console.log("REQUIRED FOUNND ", docs);
            }
            await Authentication.create({
                phoneNo: phoneNo,
                otp: OTP.toString(),
                type,
                shouldHaveVehicle: (type === 'driver' || type === 'vendor') ? true : false,
                userDocument: docs
            })
        } else {
            if (user.type !== type) {
                console.log("This Number is already in use ")
                return res.status(400).json({
                    message: "This Number is already in use"
                })
            }
            user.otp = OTP.toString();
            await user.save()
        }
        console.log("OTP TO BE SEND IS ", OTP)

        if (phoneNo.toString() === '1906991906') {
            return res.status(202).json({
                message: "Welcome Test User",
                otp: OTP
            })
        }

        //     const response = await axios.get(URL);
        //     console.log('RESPONSE IS ', response.data)
        //     if (response.status === 200) {
        //         return res.status(200).json({
        //             message: 'OTP sent successfully'
        //         })
        //     }else{
        //         throw Error("AXIOS CALL ERROR",response?.error)
        //     }

        return res.status(200).json({
            message: 'OTP sent successfully'
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({message : 'Internal Server Error'});
    }
    console.log("OTP TO BE SEND IS ", OTP)

}
export const verifyOtp = async (req, res) => {
    console.log('/create-session', req.body)
    const { phoneNo, otp } = req.body
    let token = ''

    let user = await Authentication.findOne({ phoneNo })
    if (!user) {
        return res.status(400).json({
            message: 'USER DOES NOT EXIST'
        })
    }
    if (user.otp === otp) {
        user.verification = true
        await user.save()
        return res.status(200).json({
            message: 'Session created!! Here is your token',
            token: jwt.sign(user.toJSON(), 'ownertnahihai', { expiresIn: `${1000 * 60 * 60 * 24 * 7 * 12}` })
        })
    } else {
        user.verification = false;
        await user.save()
        return res.status(400).json({
            message: 'OTP DOES NOT MATCH!! DO NOT ENTER MANUALLY',
            token: null
        })
    }
}
export const deleteAccount = async (req, res) => {
    console.log('/authentication/delete-account', req.user);
    try {
        let deletedUser = req.user
        let passiveDetails = await PassiveBooking.deleteMany({ id: deletedUser._id })
        console.log('PD', passiveDetails)
        let activeDetails = await ActiveBooking.deleteMany({ authenticationId: deletedUser._id })
        console.log("AD", activeDetails)
        await Authentication.deleteOne({ phoneNo: deletedUser.phoneNo })
        return res.status(200).json({
            message: 'USER DELETED SUCCESSFULLY'
        })
    } catch (error) {
        console.log("ERROR CLEARING ACCOUNT ", error)
        return res.status(400).json({
            message: 'Internal Server Error'
        })
    }
}