import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';
import { erroMidlleware } from './midlleware/erroMidlleware.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(erroMidlleware);

app.listen(PORT, () => {
  // console.log(`Server started on port ${PORT}`);
});
