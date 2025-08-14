import express from 'express';
import { getCampaignReport } from '../controllers/campaignReportController.js';

const router = express.Router();
router.get('/campaigns', getCampaignReport);
export default router;
