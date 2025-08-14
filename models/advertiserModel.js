import mongoose from "mongoose";

const advertiserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    status: {
      type: String,
      enum: ['Active', 'Blocked', 'Deleted', 'Pause', 'Pending', 'Rejected'],
      default: 'Active',
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    AdId: { type: Number, required: true },
  },
  { timestamps: true }
);

const Advertiser = mongoose.model("Advertiser", advertiserSchema);
export default Advertiser;
