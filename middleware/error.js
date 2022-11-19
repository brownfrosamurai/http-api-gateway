
const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;
  // Log to console for dev
  console.log(`Error: ${err}`);

  console.log(`Error: ${err.name}`);

  // Mongoose bad ObjectId
  if (err.name === 'TypeError') {
    next(error)
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server Error' });
};

module.exports = errorHandler;