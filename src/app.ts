import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to your TypeScript Express API!');
});

app.get('/kaoru', (req: Request, res: Response) => {
  res.send('Kaoru is a bad man!');
});

app.listen(port, () => {
  console.log(`Server is shining at http://localhost:${port}`);
});