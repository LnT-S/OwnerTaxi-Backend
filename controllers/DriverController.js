import ActiveBooking from '../models/ActiveBooking.js'
import PassiveBooking from '../models/PassiveBooking.js';
import Authentication from '../models/Authentication.js';
import Requirement from '../models/Requirement.js';


import path from 'path'
import * as fs from 'fs'
const __dirname = path.resolve(path.dirname(''));


export const booking = async (req, res) => {
    console.log('API : /driver/booking \n', req.user, '\n', req.body)
    try {
        let previousBooking = await PassiveBooking.find({ id: req.user._id })
        console.log('>>', previousBooking)
        if (previousBooking.length >= 5) {
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
        console.log('ERROR CREATING BOOKING', error)
        return res.status(400).json({
            message: 'Internal Server Error'
        })
    }
}
export const getLocalBooking = async (req, res) => {
    console.log("API : /driver/get-local-bookings", req.user);

    let bookings = await ActiveBooking.find().populate({
        path: "passiveBookingId",
        select: 'pickUp drop budget bookingType bookingSubType status acceptor _id',
        match: { status: { $in: ['pending', 'bidstarted'] }, bookingType: "local" }
    })

    let data = bookings.filter((el, i) => {
        if (el.passiveBookingId !== null) return true; else return false
    })
    console.log("***", data)


    return res.status(200).json({
        message: 'LOCAL BOOOKING FROM CUSTOMER AND DRIVER',
        data: data
    })
}
export const getIntercityBookingFromPostVendor = async (req, res) => {
    console.log("API : /driver/get-intercity-bookings-post-vendor", req.user);
    try {
        let bookings = await PassiveBooking.find({
            $or: [{ initiator: "driver" }, { initiator: "vendor" }],
            $or: [{ bookingType: "intercity" }, { bookingType: "rental" }]
        })
        return res.status(200).json({
            message: 'INTERCITY BOOOKING FROM VENDOR',
            data: bookings
        })
    } catch (error) {
        console.log("ERROR IN POST VENDOR INTERCITY DATA FETCH ", error);
        return res.status(400).json({
            message: "Internal Server Error"
        })
    }
}
export const addVehicle = async (req, res) => {
    console.log("/add-vehicle", req.user)
    const { type, subType, capacity, vehicleNo } = req.body
    try {

        if (!type && !subType && !capacity && !vehicleNo) {
            return res.status(400).json({
                message: 'Incomplete Vehicle Information'
            })
        }

        let vehicleInfo = await Authentication.findOne({
            vehicle: {
                $elemMatch: {
                    vehicleNo
                }
            }
        })
        console.log("VEHICLE FOUND ", vehicleInfo)
        if (vehicleInfo === null || vehicleInfo === undefined) {
            let required = await Requirement.aggregate([
                // Deconstruct the array field
                { $unwind: "$documentsList" },
                // Match documents where field1 is 'aman'
                { $match: { "documentsList.documentFor": "Vehicle" } },
                // Group by field1 and count occurrences
                {
                    $group: {
                        _id: "$documentsList.documentFor",
                        count: { $sum: 1 }
                    }
                }
            ]);
            let requiredArray = await Requirement.aggregate([
                // Deconstruct the array field
                { $unwind: "$documentsList" },
                // Match documents where field1 is 'aman'
                { $match: { "documentsList.documentFor": "Vehicle" } },
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

            // console.log("REQUIRED FOUNND ", required, requiredArray[0].vehicleDocuments);
            let docs = []
            let temp;
            requiredArray[0]?.vehicleDocuments?.forEach(ele => {
                temp = { ...ele, status: 'Missing', image: '' }
                docs.push(temp)
            })
            console.log("REQUIRED FOUNND ", required, docs);
            let newVehicleInfo = await Authentication.findByIdAndUpdate(req.user._id, {
                $push: {
                    vehicle: { type, subType, capacity, vehicleNo, document: docs, pending: required[0]?.count }
                }
            }, { new: true })
            return res.status(200).json({
                message: 'VEHICLE ADDED SUCCESSFULLY',
                data: { vehicleInfo, newVehicleInfo }
            })
        } else {
            return res.status(400).json({
                message: 'This vehicle has already been registered'
            })
        }
    } catch (error) {
        console.log("ERORR ADDING VEHICLE ", error)
        return res.status(500).json({
            message: 'Internal server Error'
        })
    }

}
export const getDocumentInfo = async (req, res) => {
    console.log("API  : /driver/get-document-info");
    let user = await Authentication.findById(req.user._id)
    return res.status(200).json({
        message: 'Document Info for ' + req.user.phoneNo,
        data: {
            driverDocuments: user.userDocument,
            vehicleDocument: user.vehicle
        }
    })
}
export const uploadDocument = async (req, res) => {
    console.log("API : /driver/upload-document", req.user);
    try {
        Authentication.uploadDocument(req, res, async function (err) {
            if (err) {
                console.log("MULTER ERRROR ", err);
                return res.status(400).json({
                    message: 'INTERNAL SERVER ERROR'
                })
            }
            console.log("BODY \n", req.body);
            console.log("FILES \n", req.file);
            if (!req.file) {
                return res.status(400).json({
                    message: 'FILE MISSING'
                })
            }
            let { documentFor, documentNo, documentName, vehicleNo } = req.body

            if (documentFor === 'Driver') {
                const user = await Authentication.findById(req.user._id);
                if (!user) {
                    throw new Error('User not found');
                }
                const document = user.userDocument.find(doc => doc.documentName === documentName);
                if (!document) {
                    throw new Error('Document not found');
                }
                document.image = path.join(Authentication.documentPath, req?.file?.filename)
                document.documentNo = documentNo;
                document.status = 'Uploaded';
                console.log("USER ", user.userDocument)
                // await document.save()/
                await user.save();
                return res.status(200).json({
                    message: "User Document Uploaded Suucessfully"
                })
            } else {
                //Vehicle UPLOADED DOCUMENTS HERE
                if (documentFor === 'Vehicle') {
                    const user = await Authentication.findById(req.user._id);
                    if (!user) {
                        console.log('User not found');
                    }
                    const vehicle = user.vehicle.find(v => v.vehicleNo === vehicleNo);
                    if (!vehicle) {
                        console.log('Vehicle not found');
                        return res.status(400).json({
                            message:  "Vehicle Missing"
                        })
                    }
                    console.log("VEHICLE FOUND ",vehicle);
                    const document = vehicle.document.find(d => d.documentName === documentName);
                    if (!document) {
                        console.log('Document not found');
                        return res.status(400).json({
                            message:  "Document Missing"
                        })
                    }
                    document.documentFor = documentFor;
                    document.documentNo = documentNo;
                    document.image = path.join(Authentication.documentPath, req?.file?.filename);
                    document.status = 'Uploaded';
                    await user.save();
                    return res.status(200).json({
                        message: "Vehicle Document Uploaded Suucessfully"
                    })
                }else{
                    //Vendor uPload
                    return res.status(200).json({
                        message: "Vendor Document Uploaded Suucessfully"
                    })
                }
            }
        })
    } catch (error) {
        console.log("MULTER ERROR ", error);
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }

}