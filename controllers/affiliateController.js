import Affiliate from '../models/affiliateModel.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, 'your_jwt_secret', { expiresIn: '30d' });
};

// Register
export const registerAffiliate = async (req, res) => {
  const { firstname, lastName, affiliateName, email, password, manager ,postBackUrl} = req.body;

  try {
    const exists = await Affiliate.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Affiliate already exists' });

    const lastAffiliate = await Affiliate.findOne().sort({ pubId: -1 }).select('pubId');
    const newPubId = lastAffiliate ? lastAffiliate.pubId + 1 : 1;

    const affiliate = await Affiliate.create({
      firstname,
      lastName,
      affiliateName,
      email,
      password,
      pubId: newPubId,
      manager,
      postBackUrl
    });

    res.status(201).json({
      _id: affiliate._id,
      firstname: affiliate.firstname,
      lastName: affiliate.lastName,
      affiliateName: affiliate.affiliateName,
      email: affiliate.email,
      pubId: affiliate.pubId,
      postBackUrl: affiliate.postBackUrl,
      token: generateToken(affiliate._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const loginAffiliate = async (req, res) => {
  const { email, password } = req.body;
  try {
    const affiliate = await Affiliate.findOne({ email });
    if (!affiliate || !(await affiliate.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      affiliate: {
        id: affiliate._id,
        name: affiliate.firstname + " " + affiliate.lastName,
        email: affiliate.email,
        pubId: affiliate.pubId,
        postBackUrl: affiliate.postBackUrl,
      },
      token: generateToken(affiliate._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Affiliates
export const getAllAffiliates = async (req, res) => {
  try {
    const affiliates = await Affiliate.find()
      .select('-password')
      .populate('manager', 'name email'); // Adjust fields as needed

    res.status(200).json(affiliates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Single Affiliate
export const getAffiliateById = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id).select('-password');
    if (!affiliate) return res.status(404).json({ message: 'Affiliate not found' });
    res.json(affiliate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Affiliate
export const updateAffiliate = async (req, res) => {
  const { firstname, lastName, email, password, status, affiliateName, manager,postBackUrl } = req.body;
  try {
    const affiliate = await Affiliate.findById(req.params.id);
    if (!affiliate) return res.status(404).json({ message: 'Affiliate not found' });

    affiliate.firstname = firstname || affiliate.firstname;
    affiliate.lastName = lastName || affiliate.lastName;
    affiliate.email = email || affiliate.email;
    affiliate.status = status || affiliate.status;
    affiliate.affiliateName = affiliateName || affiliate.affiliateName;
    affiliate.postBackUrl = postBackUrl || affiliate.postBackUrl;
    affiliate.manager = manager || affiliate.manager;
    if (password) affiliate.password = password;

    const updated = await affiliate.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Affiliate
export const deleteAffiliate = async (req, res) => {
  try {
    const affiliate = await Affiliate.findByIdAndDelete(req.params.id);
    if (!affiliate) return res.status(404).json({ message: 'Affiliate not found' });
    res.json({ message: 'Affiliate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
