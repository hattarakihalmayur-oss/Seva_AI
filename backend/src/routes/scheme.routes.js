import { Router } from 'express';
import { getSchemes, getSchemeByIdentifier, seedSchemes } from '../controllers/scheme.controller.js';

const router = Router();

// Public routes for scheme discovery
router.get('/', getSchemes);
router.get('/:identifier', getSchemeByIdentifier);

// Seeding endpoint (development/admin convenience)
router.post('/seed', seedSchemes);

export default router;
