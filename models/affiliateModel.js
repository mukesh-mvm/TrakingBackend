import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const affiliateSchema = new mongoose.Schema(
  {
    firstname: { type: String,
         required: true 
        },
    lastName: { type: String, required: true },
    affiliateName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Blocked', 'Deleted', 'Pause', 'Pending', 'Rejected'],
      default: 'Active',
    },
    pubId: { type: Number, required: true },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    postBackUrl:{
        type:String,
    }
  },
  { timestamps: true }
);

// Hash password before saving
affiliateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
affiliateSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Affiliate = mongoose.model("Affiliate", affiliateSchema);
export default Affiliate;
