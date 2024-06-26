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
dotenv.config()

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
                                    in: { documentFor: "$$obj.documentFor", documentName: "$$obj.documentName",
                                    required : "$$obj.required",autoGenerateNo :"$$obj.autoGenerateNo" } // Exclude _id field
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
        const response = await axios.get(URL);
        console.log('RESPONSE IS ', response.data)
        if (response.status === 200) {
            return res.status(200).json({
                message: 'OTP sent successfully'
            })
        } else {
            console.log("AXIOS CALL ERROR", response?.error)
            return res.status(400).json({
                message: 'SMS SERVER DOWN !! TRY AFTER SOME TIME'
            })
        }
        // return res.status(200).json({
        //     message: 'OTP sent successfully'
        // })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
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
            message: 'OTP DOES NOT MATCH!!ENTER CORRECT OTP',
            token: null
        })
    }
}
export const updateSubscription = async (req, res) => {
    console.log("API : /authentication/update-subscription");
    try {
        const { sId } = req.body
        if (!sId) {
            res.status(400).json({ message: 'Subscription Id Required' });
        }
        const response = await axios.get(`https://onesignal.com/api/v1/players/${sId}?app_id=${process.env.ONESIGNAL_APP_ID}`, {
            headers: {
                'Authorization': `Basic ${process.env.ONESIGNAL_APP_KEY}`
            }
        });
        console.log("RESPONSE OF SUBSCRIPTION ", response.data)
        if (response.status !== 200) {
            return res.status(400).json({
                message: response.data
            })
        }
        let user = await Authentication.findOne({ phoneNo: req.user.phoneNo })
        // console.log("USER IS ",user);
        if (!user) {
            return res.status(400).json({ message: 'User Not Found' });
        }
        if (user.subscriptionId !== sId) {
            user.subscriptionId = sId
            await user.save()
        }
        return res.status(200).json({
            message: "Subscribed To Notifications",
            data: user.subscriptionId
        })
    } catch (error) {
        // console.log("ERROR IN UPDATING SUBSCRIPTION ", error?.response?.status ,error.name, Object.keys(error));
        if(error?.response?.status===400 && error?.name==="AxiosError"){
            return res.status(error?.response?.status).json({
                message : "Subscription Id Does Not Exist",
                data : error?.response?.data
            })
        }
        res.status(500).json({
            message: 'Internal Server Error',
            data : error
        });

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
export const deleteAccountLink = async (req, res) => {
    console.log('/authentication/request-to-delete/:phoneNo');
    try {
        console.log(("QUERY", req.query));
        let { phoneNo } = req.query
        let user = await Authentication.findOne({ phoneNo })
        console.log("USER ", user);
        if (!user || user === undefined) {
            return res.status(400).json({
                message: 'User does not belong to Owner Taxi Family'
            })
        } else {
            user.requestToDelete = true
            await user.save()
            return res.status(200).json({
                message: 'Your Request has been accepted. Your account will deleted within 7 days in case of no activity. Make Sure You donot login to your account'
            })
        }
    } catch (error) {
        console.log("ERROR CLEARING ACCOUNT ", error)
        return res.status(400).json({
            message: 'Invalid PhoneNumber'
        })
    }
}