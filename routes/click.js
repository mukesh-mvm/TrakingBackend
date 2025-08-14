import express from 'express';
import { trackClick } from '../controllers/clickcontroller.js';
const router = express.Router();

router.get('/', trackClick);
export default router;
