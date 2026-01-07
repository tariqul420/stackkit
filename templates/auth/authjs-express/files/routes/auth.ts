import { Router } from 'express';
import { Auth } from '@auth/core';
import { authConfig } from '../lib/auth';

const router = Router();

router.all('/auth/*', async (req, res) => {
  const response = await Auth(req, authConfig);
  return res.status(response.status).json(response.body);
});

export default router;
