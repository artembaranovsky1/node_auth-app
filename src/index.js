import express from 'express';
import cors from 'cors';

import { client } from './utils/db.js';
import './models/user.js';

import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { erroMidlleware } from './midlleware/erroMidlleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(authRouter);
app.use('/users', userRouter);

app.use((req, res) => {
  res.status(404).json({
    message: 'Not Found',
  });
});

app.use(erroMidlleware);

await client.authenticate();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${PORT}`);
});
