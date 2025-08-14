import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  campaignId: String,
  pubId: String,
  clickId: String,
  ip: String,
  userAgent: String,
  referrer: String,
  isUnique: Boolean,

  originalClick:{
    type:String,
  },
  timestamp: { type: Date, default: Date.now },
  
});

export default mongoose.model('Click', clickSchema);



// import mongoose from 'mongoose';

// const clickSchema = new mongoose.Schema({
//   campaignId: String,
//   pubId: String,
//   clickId: String,
//   ip: String,
//   userAgent: String,
//   referrer: String,
//   timestamp: { type: Date, default: Date.now },
//   isUnique: Boolean
// });

// export default mongoose.model('Click', clickSchema);
