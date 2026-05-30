import express from 'express';
import {
  requestCutter,
  updateJobStatus,
  getMyJobs,
  getJobDetails,
  acceptJob,
  hireCutter,
  updateCuttingProgress,
} from '../../controllers/cutting.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isBuyer, isCutter } from '../../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * NEW ENDPOINTS - Service Hub API
 */

// POST /api/v1/cutting-jobs
// Buyer requests a cutter to cut a gem
// Only buyers can create cutting job requests
router.post('/', isBuyer, requestCutter);

// GET /api/v1/cutting-jobs/my-jobs
// Role-based endpoint:
// - Cutters see jobs assigned to them
// - Buyers see jobs they requested
// - Admins see all jobs
router.get('/my-jobs', getMyJobs);

// GET /api/v1/cutting-jobs/:id
// Get details of a specific cutting job
// Only job participants (buyer/cutter) or admins can view
router.get('/:id', getJobDetails);

// PUT /api/v1/cutting-jobs/:id/status
// Cutter updates job status and progress
// Only assigned cutter can update
router.put('/:id/status', isCutter, updateJobStatus);

// PUT /api/v1/cutting-jobs/:id/accept
// Cutter accepts a pending cutting job
// Only assigned cutter can accept
router.put('/:id/accept', isCutter, acceptJob);

/**
 * LEGACY ENDPOINTS - Backward Compatibility
 */
router.post('/hire', isBuyer, hireCutter);
router.put('/:jobId/progress', isCutter, updateCuttingProgress);

export default router;