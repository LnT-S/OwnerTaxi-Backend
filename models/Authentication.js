import mongoose from "mongoose";

const authenticationSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    phoneNo: {
      type: Number,
      unique: true,
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
    otp: {
      type: Number,
    },
    verification: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Authentication = mongoose.model("Authentication", authenticationSchema);

export default Authentication;
