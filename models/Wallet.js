import mongoose, { mongo } from "mongoose";
import multer from 'multer'
import path from 'path'
const __dirname = path.resolve(path.dirname(''));
const SS_PATH = path.join('/uploads/screenShots');


const walletSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Authentication",
    },
    balance: {
        type: Number,
        default: 0
    },
    transactionList: [
        {
            date: {
                type: Number,
                default: new Date().getTime()
            },
            amount: {
                type: Number
            },
            status: {
                type: String,
                enum : ["uprolled","verifed","discarded"]
            },
            ss: {
                type: String,
            }
        }
    ]
}, {
    timestamps: true
})

try {
    let ssStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, SS_PATH))
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = new Date().getTime();
            cb(null, file.fieldname + '-' + uniqueSuffix)
        }
    })
    walletSchema.statics.uploadSs = multer({ storage: ssStorage }).single('ss');
    walletSchema.statics.ssPath = SS_PATH;
} catch (error) {
    console.log("ERROR IN MULTER CONFIGURATION ", error)
}

const Wallet = mongoose.model('Wallet', walletSchema)
export default Wallet