import { kMaxLength } from "buffer";
import mongoose from "mongoose";
import multer from 'multer'
import { type } from "os";
import path from 'path'
const __dirname = path.resolve(path.dirname(''));
const AVATAR_PATH = path.join('/uploads/images');
const DOCUMENT_PATH = path.join('/uploads/documents')

const authenticationSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    phoneNo: {
      type: Number,
      required: true,
      unique: true,
      maxLength: 9999999999
    },
    currentState: {
      type: 'String'
    },
    subscriptionId: {
      type: String
    },
    otp: {
      type: String,
    },
    type: {
      type: String,
      enum: ["vendor", "driver", "superadmin", "customer"],
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
      type: Number
    },
    shouldHaveVehicle: {
      type: Boolean,
      default: false,
    },
    expiryDateForDocuments: {
      type: String
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
        pending: {
          type: Number
        },
        vehicleNo: {
          type: String
        },
        document: [
          {
            required: {
              type: Boolean,
              default: false
            },
            autoGenerateNo: {
              type: Boolean,
              default: false
            },
            documentFor: {
              type: String,
            },
            documentNo: {
              type: String,
            },
            image: {
              type: String,
            },
            documentName: {
              type: String
            },
            comment: {
              type: String
            },
            status: {
              type: String,
              enum: ['Missing', 'Uploaded', 'Accept', 'Reject']
            }
          }
        ]
      },
    ],
    userDocument: [
      {
        required: {
          type: Boolean,
          default: false
        },
        autoGenerateNo: {
          type: Boolean,
          default: false
        },
        documentName: {
          type: String
        },
        documentNo: {
          type: String,
        },
        image: {
          type: String,
        },
        comment: {
          type: String
        },
        status: {
          type: String,
          enum: ['Missing', 'Uploaded', 'Accept', 'Reject']
        }
      }
    ],
    verification: {
      type: Boolean,
      default: false
    },
    requestToDelete: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: String,
      enum: ["Owner Taxi", "Vendor", ""],
      default: ""
    }
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
  authenticationSchema.statics.uploadDocument = multer({ storage: documentStorage }).single('document');
  authenticationSchema.statics.avatarPath = AVATAR_PATH;
  authenticationSchema.statics.documentPath = DOCUMENT_PATH;

} catch (error) {
  console.log("ERROR IN MULTER CONFIGURATION ", error)
}

const Authentication = mongoose.model("Authentication", authenticationSchema);

export default Authentication;
