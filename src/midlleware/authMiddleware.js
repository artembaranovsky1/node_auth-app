import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    return res.status(401);
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    return res.status(401);
  }

  next();
};
