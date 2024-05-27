import mongoose, { mongo } from "mongoose";

const requirementSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Authentication",
    },
    documentsList: [
        {
            documentFor: {
                type: String,
                enum: ['Driver', 'Vehicle']
            },
            documentName: {
                type: String,
            },
            locality: {
                type: String,
                enum : ['Private', 'Permit']
            },
            required: {
                type: Boolean,
                default: false
            },
            autoGenerateNo: {
                type: Boolean,
                default: false
            },
        }
    ]
}, {
    timestamps: true
})

const Requirement = mongoose.model('Requirement', requirementSchema)
export default Requirement