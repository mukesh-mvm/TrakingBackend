import mongoose from 'mongoose';

const conversionSchema = new mongoose.Schema({
  campaignId: String,
  pubId: String,
  clickId: String,
  amount: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Conversion', conversionSchema);
