import { Router } from 'express';
import {
  getSavedSchemes,
  saveScheme,
  removeSavedScheme,
  checkSavedStatus,
} from '../controllers/savedScheme.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// All saved scheme routes require authentication
router.use(protect);

router.get('/', getSavedSchemes);
router.post('/', saveScheme);
router.delete('/:schemeSlug', removeSavedScheme);
router.get('/check/:schemeSlug', checkSavedStatus);

export default router;
