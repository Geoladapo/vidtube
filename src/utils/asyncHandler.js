export const asyncHandler = (catchAsync) => {
  return (req, res, next) => {
    Promise.resolve(catchAsync(req, res, next)).catch((err) => next(err));
  };
};
