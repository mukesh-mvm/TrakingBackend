// import mongoose from "mongoose";

// const compaignSchema = new mongoose.Schema(
//   {
//     offerName: {
//       type: String,
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: ['Active', 'Blocked', 'Deleted', 'Pause', 'Pending', 'Rejected'],
//       default: 'Active',
//     },

//     compId: {
//       type: Number,
//       unique: true,
//     },

//     devices: {
//       type: [String],
//       enum: ['cctv', 'mobile', 'tablet', 'desktop'],
//       validate: {
//         validator: function (val) {
//           return val.length > 0;
//         },
//         message: 'At least one device must be selected',
//       },
//     },

//     startDate: {
//       type: Date,
//     },

//     endDate: {
//       type: Date,
//     },

//     type: {
//       type: String,
//       enum: ['web', 'app', 'apk'],
//     },

//     trakingUrl: {
//       type: String,
//       required: true,
//     },

//     payout: {
//       type: String,
//     },

//     advertiser: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Advertiser",
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// // Pre-save middleware to increment compId
// compaignSchema.pre("save", async function (next) {
//   if (!this.compId) {
//     const lastCompaign = await mongoose
//       .model("Compaign")
//       .findOne()
//       .sort({ compId: -1 })
//       .lean();
//     this.compId = lastCompaign && lastCompaign.compId ? lastCompaign.compId + 1 : 370;
//   }
//   next();
// });

// const Compaign = mongoose.model("Compaign", compaignSchema);
// export default Compaign;


import mongoose from "mongoose";

const compaignSchema = new mongoose.Schema(
  {
    offerName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['Active', 'Blocked', 'Deleted', 'Pause', 'Pending', 'Rejected'],
      default: 'Active',
    },

    compId: {
      type: Number,
      unique: true,
    },

    devices: {
      type: [String],
      enum: ['cctv', 'mobile', 'tablet', 'desktop'],
      validate: {
        validator: function (val) {
          return val.length > 0;
        },
        message: 'At least one device must be selected',
      },
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    type: {
      type: String,
      enum: ['web', 'app', 'apk'],
    },

    trakingUrl: {
      type: String,
      required: true,
    },

    payout: {
      type: String,
    },

    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertiser",
      default: null,
    },


    // new
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  saleAmount: { type: Number, default: 0 },
  extendedConversions: { type: Number, default: 0 },
  cancelledConversions: { type: Number, default: 0 },
  pendingConversions: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 }, // CR in %


  },
  { timestamps: true }
);

// Pre-save middleware to increment compId
compaignSchema.pre("save", async function (next) {
  if (!this.compId) {
    const lastCompaign = await mongoose
      .model("Compaign")
      .findOne()
      .sort({ compId: -1 })
      .lean();
    this.compId = lastCompaign && lastCompaign.compId ? lastCompaign.compId + 1 : 370;
  }
  next();
});

const Compaign = mongoose.model("Compaign", compaignSchema);
export default Compaign;
