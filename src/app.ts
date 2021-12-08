import express, { Request, Response, NextFunction } from 'express';
import routes from './routes';
import mongoose from 'mongoose';
import config from 'config';

const app = express();
const port: number = 5000;

const mongURI = config.get<string>('URI');
console.log(`mongURI: ${mongURI}`);

mongoose
  .connect(mongURI)
  .then(() => console.log(`MongoDB Connected...`))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  console.log(`nodemone`);
  res.send('Hello Typescript World!!!');
});

app.listen(port, async () => {
  console.log(`Server http://localhost:${port}`);
  routes(app);
});
