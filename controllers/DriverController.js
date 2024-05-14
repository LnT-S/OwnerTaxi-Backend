import ActiveBooking from '../models/ActiveBooking.js'
import PassiveBooking from '../models/PassiveBooking.js';
import Authentication from '../models/Authentication.js';
import Requirement from '../models/Requirement.js';

import path from 'path'
import * as fs from 'fs'
import { log } from 'console';
import Wallet from '../models/Wallet.js';
const __dirname = path.resolve(path.dirname(''));

export const getProfileInfo = async (req, res) => {
    console.log('API : /customer/get-profile-info \n', req.user)
    return res.status(200).json({
        message: `PROFILE FOR ${req.user.phoneNo}`,
        data: req.user
    })
}
export const booking = async (req, res) => {
    console.log('API : /driver/booking \n', '\n', req.body)
    try {
        let previousBooking = await PassiveBooking.find({ id: req.user._id })
        console.log('>>', previousBooking)
        // if (previousBooking.length >= 5) {
        //     console.log("BOOKING LIMIT REACHED")
        //     return res.status(400).json({
        //         message: 'Your booking limit has been reached !'
        //     })
        // }
        let bookingNo = previousBooking.length + 1
        let psvBooking = await PassiveBooking.create({ id: req.user._id, ...req.body, status: "pending", bookingNo })
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
        let pbookings = await PassiveBooking.find({
            $or: [{ initiator: "driver" }, { initiator: "vendor" }],
            $or: [{ bookingType: "intercity" }, { bookingType: "rental" }],
            $or: [{ status: 'pending' }, { status: 'bidstarted' }]
        }).sort({ createdAt: -1 })
        let abookings = await PassiveBooking.find({
            $or: [{ initiator: "driver" }, { initiator: "vendor" }],
            $or: [{ bookingType: "intercity" }, { bookingType: "rental" }],
            status: "accepted"
        }).sort({ createdAt: -1 })
        return res.status(200).json({
            message: 'INTERCITY BOOOKING FROM VENDOR',
            data: [...pbookings, ...abookings]
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
                        return res.status(400).json({
                            message: "Token Expired !! Login Again Please"
                        })
                    }
                    const vehicle = user.vehicle.find(v => v.vehicleNo === vehicleNo);
                    if (!vehicle) {
                        console.log('Vehicle not found');
                        return res.status(400).json({
                            message: "Vehicle Missing"
                        })
                    }
                    console.log("VEHICLE FOUND ", vehicle);
                    const document = vehicle.document.find(d => d.documentName === documentName);
                    if (!document) {
                        console.log('Document not found');
                        return res.status(400).json({
                            message: "Document Missing"
                        })
                    }
                    document.documentFor = documentFor;
                    document.documentNo = documentNo;
                    document.image = path.join(Authentication.documentPath, req?.file?.filename);
                    document.status = 'Uploaded';
                    vehicle.pending = vehicle.pending - 1
                    await user.save();
                    return res.status(200).json({
                        message: "Vehicle Document Uploaded Suucessfully"
                    })
                } else {
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
export const acceptIntercityBooking = async (req, res) => {
    console.log("API : /driver/accept-intercity-booking", req.user);
    const { bookingId } = req.body
    let acceptorId = req.user._id;
    try {
        let booking = await PassiveBooking.findById(bookingId);
        let bookingPostUser = await Authentication.findOne(booking.id)
        let acceptor = await Authentication.findById(acceptorId);

        // console.log("IDS ",acceptorId.toString(),booking.id.toString())
        if (acceptorId.toString() === booking.id.toString()) {
            return res.status(300).json({
                message: 'You have posted this Booking',
            })
        }
        if (booking.status === 'pending' || booking.status === 'bidstarted') {
            booking.status = 'bidstarted'
        } else {
            return res.status(400).json({
                message: "Booking now cannot be accepted"
            })
        }
        let actBooking = await ActiveBooking.findOne({ passiveBookingId: bookingId })
        let hasBooked = actBooking.driverResponse.find(v => v.driverId.toString() === req.user._id.toString())
        console.log("000", hasBooked)
        if (hasBooked !== null && hasBooked !== undefined) {
            return res.status(200).json({
                message: "You have already accepted this booking",
                data: { phoneNo: hasBooked.driverPhone }
            })
        }
        ActiveBooking.findOneAndUpdate({ passiveBookingId: bookingId }, {
            $push: {
                driverResponse: {
                    bookingPostedBy: bookingPostUser.type,
                    driverPhone: acceptor.phoneNo,
                    driverId: acceptorId,
                    budget: booking.budget,
                    rating: acceptor.rating,
                    name: acceptor.name,
                    image: acceptor.avatar
                }
            }
        }, {
            new: true
        })
            .then(async data => {
                await booking.save()
                return res.status(200).json({
                    message: 'Booking Has Been Accepted',
                    data: { phoneNo: bookingPostUser.phoneNo }
                })
            })
            .catch(err => {
                console.log("ERROR UPDATING ACTIVE BOOOKING ", err)
                return res.status(500).json({
                    message: 'Internal Server Error'
                })
            })
    } catch (error) {
        console.log("ERROR ACCEPTING THE INTERCITY BOOKING ", error)
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }

}
export const unacceptTheBooking = async (req, res) => {
    console.log("API : /driver/unaccept-the-booking")
    const { bookingId } = req.body
    if (bookingId === undefined) {
        return res.status(400).json({
            message: 'No Booking Id Found'
        })
    }
    try {
        let actBooking = await ActiveBooking.findOneAndUpdate({
            passiveBookingId: bookingId
        }, {
            $pull: { driverResponse: { driverId: req.user._id.toString() } }
        }, {
            new: true
        });
        let psvBooking = await PassiveBooking.findById(actBooking.passiveBookingId)
        if (actBooking.driverResponse.length === 0) {
            psvBooking.status = 'pending'
            await psvBooking.save()
        }
        return res.status(200).json({
            message: 'Booking UnAccepted'
        })
    } catch (error) {
        console.log("ERRROR UNACCEPTING THE BOOKING ", error);
        return res.status(400).json({
            message: 'Cannot Un acccept the booking',
        })
    }

}
export const checkWhetherAcceptedTheBooking = async (req, res) => {
    console.log("API : /driver/check-whether-accepted-the-booking")
    const { bookingId } = req.body
    if (!bookingId) {
        return res.status(400).json({
            message: 'No Booking Id Found'
        })
    }
    let actBooking = await ActiveBooking.findOne({ passiveBookingId: bookingId });
    let check = actBooking.driverResponse.find(v => v.driverId === req.user._id.toString())
    console.log("WHETHER ACCEPTED ", check);
    if (check !== null && check !== undefined) {
        return res.status(200).json({
            message: "You Have acceted",
            data: { accepted: true, phoneNo: check.driverPhone }
        })
    } else {
        return res.status(200).json({
            message: "You Have Not Acceted",
            data: { accepted: false }
        })

    }
}
export const getBookingsDriverHasAccepted = async (req, res) => {
    console.log("API : /driver/get-bookings-i-have-accepted")
    let userId = req.user._id.toString()
    try {
        let result = await ActiveBooking.find({ "driverResponse.driverId": userId })
            .populate('passiveBookingId')
            .populate({
                path: 'authenticationId',
                select: 'phoneNo -_id'
            })
            .sort({ createdAt: -1 })
        console.log('Bookings ', result);
        return res.status(200).json({
            message: 'List of Bookings You have Accepted',
            data: result
        })
    } catch (error) {
        console.log("ERROR FINDING THE BOOKING", error);
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}
export const getBookingsDriverHasPosted = async (req, res) => {
    console.log("API : /driver/get-bookings-i-have-posted")
    try {
        let bookings = await ActiveBooking.find({
            authenticationId: req.user._id
        })
            .populate('passiveBookingId')
            .populate({
                path: 'authenticationId',
                select: 'phoneNo -_id'
            })
            .sort({ createdAt: -1 })
        
        let sorted = bookings.filter(el=>(el.passiveBookingId.status==="pending" || el.passiveBookingId.status==="bidstarted"))
        console.log("SORTED ",sorted.length);
        return res.status(200).json({
            message: 'List of Bookings You have Posted',
            data: sorted
        })
    } catch (error) {
        console.log('ERROR GETTING MY BOOKINGS ', error);
        return res.status(500).json({
            message: 'Internal Server Error',
        })
    }
}
export const isDocumentVerified = async (req, res) => {
    console.log("API : /driver/is-document-verified");
    try {
        let user = await Authentication.findById(req.user._id)
        const allUserAccepted = user.userDocument.every(doc => doc.status === "Accept");
        console.log("ALL USER ACCEPTED ", allUserAccepted);
        const vehicle = user.vehicle.every(v => v.document.every(el => el.status === 'Accept') === true)
        console.log("VEHICLS ACCEPTED ", vehicle)
        if (vehicle) {
            if (allUserAccepted) {
                return res.status(200).json({
                    message: 'ALL Documents accepted',
                    data: { verified: true }
                })
            } else {
                return res.status(400).json({
                    message: 'User Documents Unverified or pending',
                    data: { verified: false }
                })
            }
        } else {
            if (allUserAccepted) {
                return res.status(400).json({
                    message: 'Vehicle Document Unverified or Pending',
                    data: { verified: false }
                })
            } else {
                return res.status(400).json({
                    message: 'Vehicle and User both documents and not verified or pending',
                    data: { verified: false }
                })
            }
        }
    } catch (error) {
        console.log("ERROR IN DOCUMENT VERIFICATION ", error);
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}
export const assignBooking = async (req, res) => {
    console.log("/driver/assign-intercity-booking", req.user)
    try {
        const { bookingId, phoneNo } = req.body
        if (!bookingId && !phoneNo) {
            return res.status(400).json({
                message: 'Incomplete Information'
            })
        }
        let assigningUser = await Authentication.findOne({
            phoneNo: phoneNo
        })
        if (!assigningUser) {
            return res.status(400).json({
                message: 'This user no longer exists'
            })
        }
        if (assigningUser._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "You cannot assign booking to self"
            })
        }
        let passiveBooking = await PassiveBooking.findById(bookingId)
        if (passiveBooking.acceptor.id !== '' && (passiveBooking.status === 'accepted')) {
            return res.status(400).json({
                message: 'Booking assigned to ' + passiveBooking.acceptor.phone
            })
        }
        passiveBooking.status = "accepted";
        passiveBooking.acceptor = {
            id: assigningUser._id,
            budget: passiveBooking.budget,
            phone: assigningUser.phoneNo
        }
        await passiveBooking.save()
        return res.status(200).json({
            message: 'Booking Assigned to ' + assigningUser.phoneNo
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}
export const unAssignBooking = async (req, res) => {
    console.log("API : /driver/un-assign-intericity-booking");
    try {
        const { bookingId, phoneNo } = req.body;
        if (!bookingId && !phoneNo) {
            return res.status(400).json({
                message: 'Incomplete Information'
            })
        }
        let passiveBooking = await PassiveBooking.findById(bookingId)
        let activeBooking = await ActiveBooking.findOne({ passiveBookingId: bookingId })
        if (passiveBooking.status === 'picked' || passiveBooking.status === 'closed') {
            return res.status(400).json({
                message: 'Driver has picked the Customer. You cannot unassign now'
            })
        }
        passiveBooking.status = "bidstarted";
        let unAssignedfrom = passiveBooking.acceptor.phone.toString()
        if (unAssignedfrom !== phoneNo) {
            return res.status(400).json({
                message: 'Booking was not assigned to ' + unAssignedfrom
            })
        }
        passiveBooking.acceptor = {
            id: null,
            budget: '',
            phone: null
        }
        await passiveBooking.save()
        return res.status(200).json({
            message: 'Booking Un Assigned from ' + unAssignedfrom
        })
    } catch (error) {
        console.log("INTERNAL SERVER ERROR ", error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const deleteBooking = async (req, res) => {
    console.log("API : /driver/delete-booking")
    try {
        const { bookingId } = req.body;
        let psvBooking = await PassiveBooking.findById(bookingId)
        console.log("PSV BOOKING ", psvBooking._id.toString(), req.user._id.toString())
        if (psvBooking.id.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                message: 'You Cannot Delete this booking'
            })
        }
        if (psvBooking.status !== 'pending' && psvBooking.status !== 'bidstarted') {
            return res.status(400).json({
                message: 'Booking is assigned and picked Up Now'
            })
        }
        await ActiveBooking.findOneAndDelete({ passiveBookingId: bookingId })
        await PassiveBooking.findByIdAndDelete(bookingId)
        return res.status(200).json({
            message: "Booking Deleted Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}
export const getHistory = async (req, res) => {
    console.log("API : /driver/get-history");
    try {
        let userId = req.user._id
        let result = await PassiveBooking.find(
            {
                $or: [
                    { "acceptor.id": userId },
                    {
                        $and: [
                            { id: userId },
                            { status: { $in: ['closed'] } }
                        ]
                    }
                ]
            })
            .populate({
                path: 'id',
                select: 'phoneNo -_id'
            })
            .sort({ createdAt: -1 })
        console.log('History ', result);
        return res.status(200).json({
            message: 'Your accepted booking history',
            data: result
        })
    } catch (error) {
        console.log("ERROR GETTING HISTORY ", error)
        return res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}
export const closeBooking = async (req, res) => {
    console.log("API : /driver/close-booking");
    try {
        const { bookingId, rating } = req.body
        const userId = req.user._id
        let result = await PassiveBooking.find({
            $and: [
                { id: userId },
                { status: { $in: ['closed'] } }
            ]
        })
        let booking = await PassiveBooking.findById(bookingId)
        let userToRate = await Authentication.findById(booking.id)
        if (result.length === 0) {
            userToRate.rating = rating
        } else {
            userToRate.rating = (rating + userToRate.rating * result.length) / result.length
        }
        await userToRate.save()
        booking.status = 'closed'
        await booking.save()
        await ActiveBooking.findOneAndUpdate({
            passiveBookingId: bookingId
        }, {
            driverResponse: []
        }, { new: true })
        return res.status(200).json({
            message: 'Thnaks for your feedback !! Booking Closed Now'
        })
    } catch (error) {
        console.log("ERROR CLOSING BOOKING ", error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }



}
export const uprollTransaction = async (req, res) => {
    console.log("API : /driver/uproll-transaction")
    try {
        Wallet.uploadSs(req, res, async function (err) {
            if (err) {
                console.log("MULTER ERROR ", err);
                return res.status(400).json({
                    message: 'INTERNAL SERVER ERROR'
                })
            }
            const { amount } = req.body
            console.log("FILES \n", req.file,amount);
            let wallet = await Wallet.findOne({id : req.user._id})
            if(!wallet){
                wallet = await Wallet.create({id : req.user._id})
            }
            wallet.transactionList.push({
                date : new Date().getTime(),
                amount,
                ss : path.join(Wallet.ssPath, req?.file?.filename),
                status : "uprolled"

            })
            await wallet.save()
            return res.status(200).json({
                message : 'Transaction Uprolled Successfully !! It will be verified within 24 hours'
            })
        })
    } catch (error) {
        console.log("ERROR UPROLLING TRANSACTION ",error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}
export const getTransactionInfo = async (req,res)=>{
    console.log("API : /driver/get-transaction-info");
    try {
        let wallet = await Wallet.findOne({id : req.user._id});
        return res.status(200).json({
            message : "Transation Info for" + req.user.phoneNo,
            data : wallet
        })
    } catch (error) {
        console.log("ERRROR IN TRANSACTION LIST ",error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}