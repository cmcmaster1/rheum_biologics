import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import router from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
