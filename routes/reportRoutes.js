import express from 'express';
import { getCampaignReport ,getCampaignByPubIdReport, getAffiliateReportByDate} from '../controllers/campaignReportController.js';


const router = express.Router();
router.get('/campaigns', getCampaignReport);
router.get('/publicerReport', getCampaignByPubIdReport);
router.get("/affiliate", getAffiliateReportByDate);

export default router;
