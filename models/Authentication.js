import mongoose from "mongoose";
import multer from 'multer'
import path from 'path'
const __dirname = path.resolve(path.dirname(''));
const AVATAR_PATH = path.join('/uploads/images');
const DOCUMENT_PATH = path.join('/ouploads/documents')

const authenticationSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    phoneNo: {
      type: Number,
      required : true,
      unique: true,
    },
    otp: {
      type: String,
    },
    type: {
      type: String,
      enum: ["vendor", "driver", "superAdmin", "customer"],
    },
    avatar: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    rating: {
      type: Number,
      validate: {
        validator: function (value) {
          return value <= 5 && value >= 0;
        },
      },
      message: "Rating Must be between 0 and 5",
    },
    shouldHaveVehicle: {
      type: Boolean,
      default: false,
    },
    vehicle: [
      {
        type: {
          type: String,
        },
        subType: {
          type: String,
        },
        capacity: {
          type: Number,
        },
        no: {
          type: String,
        },
        info: {
          document: {
            image: {
              type: String,
            },
            name: {
              type: String,
            },
            documentNo: {
              type: String,
            },
          },
        },
      },
    ],
    verification: {
      type: Boolean,
      default : false
    },
  },
  {
    timestamps: true,
  }
);

try {
  let imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, AVATAR_PATH))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  let documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, DOCUMENT_PATH))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  authenticationSchema.statics.uploadImage = multer({ storage: imageStorage }).single('avatar');
  authenticationSchema.statics.uploadDocument = multer({ storage: imageStorage }).array('documents');
  authenticationSchema.statics.avatarPath = AVATAR_PATH;
  authenticationSchema.statics.documentPath = DOCUMENT_PATH;
  
} catch (error) {
  console.log("ERROR IN MULTER CONFIGURATION ", error)
}

const Authentication = mongoose.model("Authentication", authenticationSchema);

export default Authentication;
