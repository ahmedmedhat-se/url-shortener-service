import express from 'express';
import * as urlController from '../controllers/urlController.js';

const router = express.Router();

router.post('/shorten', urlController.shorten);
router.get('/analytics/:shortCode', urlController.analytics);
router.get('/:shortCode', urlController.redirect);

export default router;