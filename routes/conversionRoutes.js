import express from 'express';
import { handlePostback } from '../controllers/conversionController.js';

const router = express.Router();

router.get('/postback', handlePostback);

export default router;
