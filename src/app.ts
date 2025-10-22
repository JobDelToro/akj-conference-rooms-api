import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from '@/config/env.ts';

import type { Request, Response } from 'express';

const app = express();
app.use(cors());
app.use(helmet());
app.use(compression());
const port = env.PORT || 3001;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.send({ status: 'ok', statusCode: 200, message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server is shining at http://localhost:${port}`);
});