export const erroMidlleware = (error, req, res, next) => {
  if (error) {
    res.status(500);

    res.send({
      message: 'Server Error',
    });
  }

  next();
};
