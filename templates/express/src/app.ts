import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';

// app initialization
const app: Application = express();
app.use(express.json());

// cors configuration
app.use(
  cors({
    origin: [env.app.site_url],
    credentials: true,
  })
);

// Home page route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// unhandled routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: any = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.status = 404;

  next(error);
});

// Global error handler
app.use(errorHandler);

export default app;
