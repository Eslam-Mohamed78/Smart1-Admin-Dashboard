import tokenModel from "../../DB/models/token.model.js";
import userModel from "../../DB/models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const isAuthenticated = asyncHandler(async (req, res, next) => {
  // data
  let { token } = req.headers;

  // check token existence and type
  if (!token || !token.startsWith(process.env.BEARER_KEY)) {
    return next(new Error("Invalid token!", { cause: 400 }));
  }
  // check payload
  token = token.split(process.env.BEARER_KEY);
  // at verify if token is expired jwt will automatic raise error
  const decoded = jwt.verify(token[1], process.env.TOKEN_SIGNATURE);
  if (!decoded) return next(new Error("Invalid token!"));

  // check token in DB
  const tokenDB = await tokenModel.findOne({ token });
  if (!tokenDB) return next(new Error("Invalid token!"));
  if (!tokenDB.isValid)
    return res.json({
      success: true,
      message: "You already Logged out! Try to Login",
    });

  // check user existence
  const user = await userModel.findOne({ _id: decoded._id });
  if (!user) return next(new Error("User not found!", { cause: 404 }));

  // pass user to request
  req.user = user;

  // response
  return next();
});

export default isAuthenticated;
