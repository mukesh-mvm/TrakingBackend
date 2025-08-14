import express from 'express';
import {
  registerAffiliate,
  loginAffiliate,
  getAllAffiliates,
  getAffiliateById,
  updateAffiliate,
  deleteAffiliate,
} from '../controllers/affiliateController.js';

const router = express.Router();

router.post('/affiliateRegister', registerAffiliate);
router.post('/affiliateLogin', loginAffiliate);
router.get('/getAllAffiliate', getAllAffiliates);
router.get('/getOneAffiliate/:id', getAffiliateById);
router.put('/updateAffiliate/:id', updateAffiliate);
router.delete('/deleteAffiliate/:id', deleteAffiliate);

export default router;
