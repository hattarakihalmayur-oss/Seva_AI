import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  listApplications,
  getApplication,
  checkReadiness,
  prefill,
  apply,
} from '../controllers/application.controller.js';

const router = Router();

// All application routes require authentication
router.use(protect);

router.get('/', listApplications);
router.get('/check/:schemeSlug', checkReadiness);
router.get('/:id', getApplication);
router.post('/prefill', prefill);
router.post('/apply', apply);

export default router;
