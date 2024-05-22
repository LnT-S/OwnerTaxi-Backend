import Requirement from '../models/Requirement.js'
import Authentication from '../models/Authentication.js'
import PassiveBooking from '../models/PassiveBooking.js'
import ActiveBooking from '../models/ActiveBooking.js'
import Wallet from '../models/Wallet.js'

export const addDocumentList = async (req, res) => {
    console.log("/add-document-to-list", req.user)
    const { documentFor, documentName , required } = req.body
    console.log(req.body)

    if (!documentFor && !documentName) {
        return res.status(400).json({
            message: 'Enter Complete Info'
        })
    }

    try {
        let admin = await Requirement.findOne({ id: req.user._id })
        if (!admin) {
            await Requirement.create({ id: req.user._id })
        }
        let list = await Requirement.findOne({
            documentsList: {
                $elemMatch: {
                    documentFor, documentName
                }
            }
        })
        console.log("LIST ", list)
        if (list === null) {
            let obj = {
                documentFor, documentName , required
            }
            let newList = await Requirement.findOneAndUpdate({ id: req.user._id }, {
                $push: { documentsList: obj }
            }, { new: true })
            console.log("LIST NOW ", newList)
            return res.status(200).json({
                message: 'Document Added Successfully'
            })
        } else {
            return res.status(400).json({
                message: 'Document Exists'
            })
        }
    } catch (error) {
        console.log("ERROR ADDING DOCUMENT ", error)
        return res.status(400).json({
            message: 'Internal Server Error'
        })
    }

}
export const getAllUserDocInfo = async (req, res) => {
    console.log("API : /superadmin/get-all-user-doc-info")
    try {
        let info = await Authentication.aggregate([
            {
                $match: {
                    $or: [{ type: "vendor" }, { type: "driver" }]
                }
            },
            {
                $project: {
                    phoneNo: true,
                    name: true,
                    email: true,
                    avatar: true,
                    vehicle: true,
                    userDocument: true
                }
            }
        ])
        console.log("DOCUMENT INFO ", info)
        return res.status(200).json({
            message: "Document Info Is",
            data: info
        })
    } catch (error) {
        console.log("ERROR IN Getting Document ", error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const setDocumentStatus = async (req, res) => {
    console.log("API : /superadmin/set-doc-status")
    try {
        const { status, phoneNo, docFor, documentNo, documentName, vehicleNo, comment } = req.body
        if (!(status && phoneNo && docFor && documentNo && documentName) || (docFor === "vehicle" && !vehicleNo)) {
            return res.status(400).json({
                message: 'Incomplete Information'
            })
        }
        let user = await Authentication.findOne({ phoneNo: phoneNo })
        if (docFor === 'driver') {
            let doc = user.userDocument.find(v => (v.documentNo === documentNo && v.documentName === documentName))
            console.log("DOC IS ", doc);
            if (doc !== null || doc !== undefined) {
                doc.status = status
                // console.log("DOCUMENT IS ", doc, user);
                await user.save()
                return res.status(200).json({
                    message: "Status Updated"
                })
            } else {
                return res.status(400).json({
                    message: "No such document found"
                })
            }
        } else {
            if (docFor === 'vehicle') {
                let vehicle = user.vehicle.find(v => v.vehicleNo === vehicleNo)
                if (status === "Accept") {
                    let doc = vehicle.document.find(v => (v.documentNo === documentNo && v.documentName === documentName))
                    if (doc !== null || doc !== undefined) {
                        doc.status = status
                        doc.comment = comment || doc.comment || ''
                        await user.save()
                        return res.status(200).json({
                            message: "Status Updated Successfully"
                        })
                    } else {
                        return res.status(400).json({
                            message: "No such document found"
                        })
                    }
                } else {
                    if (status === "Reject") {
                        console.log(vehicle.pending, typeof (vehicle.pending))

                        let doc = vehicle.document.find(v => (v.documentNo === documentNo && v.documentName === documentName))
                        if (doc !== null || doc !== undefined) {
                            if (doc.status !== status) {
                                vehicle.pending = vehicle.pending + 1
                                doc.status = status
                                doc.comment = comment || doc.comment || ''
                            }
                            await user.save()
                            return res.status(200).json({
                                message: "Status Updated Succesfully"
                            })
                        } else {
                            return res.status(400).json({
                                message: "No such document found"
                            })
                        }
                    } else {
                        return res.status(400).json({
                            message: "Invalid Status"
                        })
                    }
                }
            } else {
                return res.status(400).json({
                    message: 'No document needed for ' + docFor
                })
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const getPaymentsInfo = async (req, res) => {
    console.log("API /superadmin/get-payment-info");
    try {
        let info = await Wallet.find({}).populate("id", "phoneNo _id name email avatar")
        return res.status(200).json({
            message: "Transactions Info",
            data: info
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const setPaymentStatus = async (req, res) => {
    console.log("API : /superadmin/set-payment-info");
    try {
        const { id, status, tId } = req.body
        let wallet = await Wallet.findById(id)
        let transaction = wallet.transactionList.find(v => v.date === tId)
        if (transaction) {
            if (status === "verifed") {
                wallet.balance = wallet.balance + transaction.amount
                transaction.status = "verifed";
                await wallet.save()
                return res.status(200).json({
                    message: "Status Upgraded Successfully"
                })
            } else {
                if (status === "discarded") {
                    transaction.status = "discarded";
                    await wallet.save()
                    return res.status(200).json({
                        message: "Status discarded successfully "
                    })
                } else {
                    return res.status(400).json({
                        message: "No Such Status Exists"
                    })
                }
            }
        } else {
            return res.status(400).json({
                message: "No Such Transaction Exists"
            })
        }
    } catch (error) {
        console.log("ERROR IN UPDATING PAYEMNETS ",error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const verifyDrivers = async (req,res)=>{
    console.log("API /superadmin/verify-drivers");
    try {
        const {phoneNo , verify} = req.body
        let driver = await Authentication.findOne({phoneNo : phoneNo})
        driver.verifiedBy = verify
        await driver.save()
        return res.status(200).json({
            message : "Driver Verified Successfully"
        })
    } catch (error) {
        console.log("ERROR IN UPDATING PAYEMNETS ",error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}