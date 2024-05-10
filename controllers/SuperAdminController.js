import Requirement from '../models/Requirement.js'

export const addDocumentList = async (req, res) => {
    console.log("/add-document-to-list", req.user)
    const { documentFor, documentName } = req.body
    console.log(req.body)

    if(!documentFor&&!documentName){
        return res.status(400).json({
            message : 'Enter Complete Info'
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
                documentFor, documentName
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
        console.log("ERROR ADDING DOCUMENT ",error)
        return res.status(400).json({
            message : 'Internal Server Error'
        })
    }

}