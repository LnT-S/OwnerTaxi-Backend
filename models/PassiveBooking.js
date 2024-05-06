import mongoose from "mongoose";

const passiveBookingSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Authentication",
  },
  initiator: {
    type: String,
    enum: ["customer", "driver", "vendor"],
  },
  pickUp: {
    description: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    date: {
      msec: {
        type: Number,
        required: true,
      },
      year: {
        type: Number,
      },
      month: {
        type: Number,
      },
      day: {
        type: Number,
      },
      hour: {
        type: Number,
      },
      min: {
        type: Number,
      },
    },
  },
  stops: [
    {
      description: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
      date: {
        msec: {
          type: Number,
        },
        year: {
          type: Number,
        },
        month: {
          type: Number,
        },
        day: {
          type: Number,
        },
        hour: {
          type: Number,
        },
        min: {
          type: Number,
        },
      },
    }
  ],
  drop: {
    description: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    date: {
      msec: {
        type: Number,
        default: new Date().getTime()
      },
      year: {
        type: Number,
        default: new Date().getFullYear()
      },
      month: {
        type: Number,
        default: new Date().getMonth()
      },
      day: {
        type: Number,
        default: new Date().getDate()
      },
      hour: {
        type: Number,
        default: new Date().getHours()
      },
      min: {
        type: Number,
        default: new Date().getMinutes()
      },
    },
  },
  budget: {
    type: Number,
  },
  bookingType: {
    type: String,
    enum: ["local", "intercity", "rental", "sharing"],
  },
  bookingSubType: {
    type: String,
    enum: ["", "oneway", "round trip"],
  },
  vehicle: {
    type: {
      type: String,
    },
    subType: {
      type: String
    },
    capacity: {
      type: Number,
    },
  },
  extrasIncluded: {
    type: Boolean,
  },
  IRPackage: {
    extraDistance : {
      type : String
    },
    extraTime : { 
      type : String
    }
  },
  status: {
    type: String,
    enum: ['accepted', 'pending', 'closed','bidstarted','cancelled']
  },
  acceptor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Authentication'
    },
    budget: {
      type: Number,
    },
    phone: {
      type: Number,
    }
  }
}, {
  timestamps: true
});

const PassiveBooking = mongoose.model('PassiveBooking', passiveBookingSchema)
export default PassiveBooking