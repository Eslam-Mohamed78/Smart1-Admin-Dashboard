import asyncHandler from "./../utils/asyncHandler.js";

const isAuthorized = (role) => {
  return asyncHandler(async (req, res, next) => {
    if (role !== req.user.role) {
      return next(new Error("Not allowed Only for Admins!", { cause: 403 }));
    }

    return next();
  });
};

export default isAuthorized;
