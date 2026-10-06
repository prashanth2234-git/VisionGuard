const successResponse = (res, data, statusCode = 200, meta = undefined) => {
  const payload = {
    success: true,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
};

const errorResponse = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = undefined) => {
  const payload = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (details && process.env.NODE_ENV !== 'production') {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse,
};
