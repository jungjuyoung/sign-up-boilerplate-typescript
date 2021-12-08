import express, { Request, Response, NextFunction } from 'express';
import config from 'config';
import connect from './utils/connect';
import logger from './utils/logger';
import routes from './routes';

const app = express();
const port = config.get<number>('port');
const host = config.get<string>('host');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  console.log(`nodemone`);
  res.send('Hello Typescript World!!!');
});

app.listen(port, async () => {
  logger.info(`Server http://${host}:${port}`);
  await connect();
  routes(app);
});
