import { ApiError } from '../controllers/expations/api.error.js';

export const guestMiddleware = (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    throw ApiError.badRequest('Ви вже авторизовані в системі');
  }

  next();
};
