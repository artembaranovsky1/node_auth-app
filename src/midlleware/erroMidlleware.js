import { ApiError } from '../controllers/expations/api.error.js';

export const erroMidlleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      message: error.message,
      errors: error.errors,
    });
  }

  return res.status(500).json({
    message: 'Server Error',
  });
};
