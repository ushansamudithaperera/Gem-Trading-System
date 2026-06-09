import express from 'express';
import {
  requestCutter,
  updateJobStatus,
  getMyJobs,
  getCutterJobs,
  getJobDetails,
  acceptJob,
  rejectJob,
  updateJobProgress,
  hireCutter,
  updateCuttingProgress,
  updateJobStatusPatch,
} from '../../controllers/cutting.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isBuyer, isCutter } from '../../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * SERVICE HUB API ENDPOINTS
 */

// POST /api/v1/cutting-jobs
// Buyer requests a cutter to cut a gem
router.post('/', isBuyer, requestCutter);

// GET /api/v1/cutting-jobs/my-jobs
// Role-based: Cutters see assigned jobs, Buyers see requested jobs, Admins see all
router.get('/my-jobs', getMyJobs);

// GET /api/v1/cutting-jobs/cutter
// Dedicated endpoint: Fetch only jobs assigned to the authenticated cutter
router.get('/cutter', isCutter, getCutterJobs);

// GET /api/v1/cutting-jobs/:id
// Get details of a specific cutting job (only participants/admin)
router.get('/:id', getJobDetails);

// PUT /api/v1/cutting-jobs/:id/status
// Cutter updates job status and progress details
router.put('/:id/status', isCutter, updateJobStatus);

// PATCH /api/v1/cutting-jobs/:id/status
// Cutter updates job status (accept/reject)
router.patch('/:id/status', isCutter, updateJobStatusPatch);

// PUT /api/v1/cutting-jobs/:id/accept
// Cutter accepts a pending cutting job
router.put('/:id/accept', isCutter, acceptJob);

// PUT /api/v1/cutting-jobs/:id/reject
// Cutter rejects a pending cutting job
router.put('/:id/reject', isCutter, rejectJob);

// POST /api/v1/cutting-jobs/:id/progress
// Cutter advances phase and pushes a progress log entry (note + photo)
router.post('/:id/progress', isCutter, updateJobProgress);

/**
 * LEGACY ENDPOINTS — Backward Compatibility
 */
router.post('/hire', isBuyer, hireCutter);
router.put('/:jobId/progress', isCutter, updateCuttingProgress);

export default router;