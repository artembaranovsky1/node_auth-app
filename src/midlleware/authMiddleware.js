import { jwtService } from '../services/jwt.service.js';
import { User } from '../models/user.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const accessToken = authHeader.split(' ')[1];

  const payload = jwtService.verify(accessToken);

  if (!payload) {
    return res.sendStatus(401);
  }

  const user = await User.findByPk(payload.id);

  if (!user) {
    return res.sendStatus(401);
  }

  if (user.activationToken !== null) {
    return res.status(403).send('Email is not activated');
  }

  req.user = user;

  next();
};
