import express from 'express';
import { scanGem, analyzeDispute } from '../../controllers/aiController';
import { upload } from '../../middleware/upload.middleware';

const router = express.Router();

// Route mappings
router.post('/scan-gem', upload.single('image'), scanGem);
router.post('/analyze-dispute', analyzeDispute);

export default router;
