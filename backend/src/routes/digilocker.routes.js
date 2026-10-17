import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getStatus,
  getAuthUrl,
  handleCallback,
  selectDocuments,
  fetchDocument,
  disconnect,
  connect,
} from '../controllers/digilocker.controller.js';

const router = Router();

// Public OAuth 2.0 callback endpoint (invoked via browser redirect from DigiLocker)
router.get('/callback', handleCallback);

// All other citizen vault operations require authentication
router.use(protect);

router.get('/status', getStatus);
router.get('/auth-url', getAuthUrl);
router.post('/select-documents', selectDocuments);
router.post('/fetch-document', fetchDocument);
router.post('/disconnect', disconnect);
router.post('/connect', connect); // Legacy test runner support

export default router;
