const { ApiError } = require('../controllers/expations/api.error');

const guestMiddleware = (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    throw ApiError.badRequest('Ви вже авторизовані в системі');
  }

  next();
};

module.exports = { guestMiddleware };
