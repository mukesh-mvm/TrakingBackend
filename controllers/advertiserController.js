import Advertiser from "../models/advertiserModel.js";

// Create
export const createAdvertiser = async (req, res) => {
  try {
    const { name, status, manager } = req.body;

    // Ensure we get a number
    const lastAdvertiser = await Advertiser.findOne()
      .sort({ AdId: -1 })
      .select('AdId');

    const lastId = lastAdvertiser && !isNaN(Number(lastAdvertiser.AdId))
      ? Number(lastAdvertiser.AdId)
      : 1;

    const newPubId = lastId + 1;

    const advertiser = new Advertiser({
      name,
      status,
      AdId: newPubId,
      manager
    });

    await advertiser.save();

    res.status(201).json({ success: true, data: advertiser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Read All
export const getAllAdvertisers = async (req, res) => {
  try {
    const advertisers = await Advertiser.find().populate("manager");
    res.json({ success: true, data: advertisers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Read by ID
export const getAdvertiserById = async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.params.id).populate("manager");
    if (!advertiser) {
      return res.status(404).json({ success: false, message: "Advertiser not found" });
    }
    res.json({ success: true, data: advertiser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update
export const updateAdvertiser = async (req, res) => {
  try {
   

    const {name,status,manager} = req.body

     const advertiser = await Advertiser.findById(req.params.id);
     if (!advertiser) return res.status(404).json({ message: 'Advertiser not found' });
     
     advertiser.name = name || advertiser.name;
     advertiser.status = status || advertiser.status;
     advertiser.manager = manager || advertiser.manager;
     advertiser.AdId =  advertiser.AdId;
      

     const updated = await advertiser.save();


    // const updated = await Advertiser.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    // });



    if (!updated) {
      return res.status(404).json({ success: false, message: "Advertiser not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete
export const deleteAdvertiser = async (req, res) => {
  try {
    const deleted = await Advertiser.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Advertiser not found" });
    }
    res.json({ success: true, message: "Advertiser deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
