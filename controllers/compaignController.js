// import Compaign from "../models/compaignModel.js";

// // Create Compaign
// export const createCompaign = async (req, res) => {
//   try {
//     const newCompaign = new Compaign(req.body);
//     await newCompaign.save();
//     res.status(201).json({ success: true, data: newCompaign });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get All
// export const getAllCompaigns = async (req, res) => {
//   try {
//     const compaigns = await Compaign.find().populate("advertiser");
//     res.status(200).json({ success: true, data: compaigns });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get One
// export const getCompaignById = async (req, res) => {
//   try {
//     const compaign = await Compaign.findById(req.params.id).populate("advertiser");
//     if (!compaign) return res.status(404).json({ success: false, message: "Compaign not found" });
//     res.status(200).json({ success: true, data: compaign });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update
// export const updateCompaign = async (req, res) => {
//   try {
//     const compaign = await Compaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!compaign) return res.status(404).json({ success: false, message: "Compaign not found" });
//     res.status(200).json({ success: true, data: compaign });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Delete
// export const deleteCompaign = async (req, res) => {
//   try {
//     const compaign = await Compaign.findByIdAndDelete(req.params.id);
//     if (!compaign) return res.status(404).json({ success: false, message: "Compaign not found" });
//     res.status(200).json({ success: true, message: "Compaign deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


import Compaign from "../models/compaignModel.js";

// Create Compaign
export const createCompaign = async (req, res) => {
  try {
     
    const {offerName,status,devices,startDate,endDate,type,trakingUrl, payout,
    saleAmount = 0,advertiser} = req.body


    const newCompaign = new Compaign({
      offerName,status,devices,startDate,endDate,type,trakingUrl,payout,advertiser,saleAmount,
      clicks: 0,
      conversions: 0,
      extendedConversions: 0,
      cancelledConversions: 0,
      pendingConversions: 0,
      conversionRate: 0,
    });
    await newCompaign.save();
    res.status(201).json({ success: true, data: newCompaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All
export const getAllCompaigns = async (req, res) => {
  try {
    const compaigns = await Compaign.find().populate("advertiser");
    res.status(200).json({ success: true, data: compaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get One
export const getCompaignById = async (req, res) => {
  try {
    const compaign = await Compaign.findById(req.params.id).populate("advertiser");
    if (!compaign) return res.status(404).json({ success: false, message: "Compaign not found" });
    res.status(200).json({ success: true, data: compaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update
// export const updateCompaign = async (req, res) => {
//   try {
//     const compaign = await Compaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!compaign) return res.status(404).json({ success: false, message: "Compaign not found" });
//     res.status(200).json({ success: true, data: compaign });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const updateCompaign = async (req, res) => {
  try {
    const compaign = await Compaign.findById(req.params.id);
    if (!compaign) {
      return res.status(404).json({ success: false, message: "Compaign not found" });
    }

    // Update each field only if provided in req.body
    compaign.offerName = req.body.offerName ?? compaign.offerName;
    compaign.status = req.body.status ?? compaign.status;
    compaign.devices = req.body.devices ?? compaign.devices;
    compaign.startDate = req.body.startDate ?? compaign.startDate;
    compaign.endDate = req.body.endDate ?? compaign.endDate;
    compaign.type = req.body.type ?? compaign.type;
    compaign.trakingUrl = req.body.trakingUrl ?? compaign.trakingUrl;
    compaign.payout = req.body.payout ?? compaign.payout;
    compaign.advertiser = req.body.advertiser ?? compaign.advertiser;
    compaign.compId =  compaign.compId

    // Stats fields
    compaign.clicks = req.body.clicks ?? compaign.clicks;
    compaign.conversions = req.body.conversions ?? compaign.conversions;
    compaign.saleAmount = req.body.saleAmount ?? compaign.saleAmount;
    compaign.extendedConversions = req.body.extendedConversions ?? compaign.extendedConversions;
    compaign.cancelledConversions = req.body.cancelledConversions ?? compaign.cancelledConversions;
    compaign.pendingConversions = req.body.pendingConversions ?? compaign.pendingConversions;
    compaign.conversionRate = req.body.conversionRate ?? compaign.conversionRate;

    const updated = await compaign.save();
    res.status(200).json({ success: true, data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Delete
export const deleteCompaign = async (req, res) => {
  try {
    const compaign = await Compaign.findByIdAndDelete(req.params.id);
    if (!compaign) return res.status(404).json({ success: false, message: "Compaign not found" });
    res.status(200).json({ success: true, message: "Compaign deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
