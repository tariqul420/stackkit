import { Router } from 'express';
import { auth } from '../lib/auth';

const router = Router();

router.all('*', async (req, res) => {
  return auth.handler(req, res);
});

export default router;
