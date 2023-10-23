import asyncHandler from "../../utils/asyncHandler.js";
import userModel from "./../../../DB/models/user.model.js";
import tokenModel from "./../../../DB/models/token.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../../utils/cloud.js";
import { search } from "../../utils/queryHelpers.js";

export const register = asyncHandler(async (req, res, next) => {
  // data
  const { userName, userEmail, userPassword } = req.body;

  // check user existence
  const userExists = await userModel.findOne({ userEmail });
  if (userExists)
    return next(new Error("User already exists!", { cause: 409 }));

  // create user
  const user = await userModel.create({
    userName,
    userEmail,
    userPassword,
  });

  // upload picture to cloud

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/admins`,
      }
    );

    // upload picture to DB
    user.userPic = { id: public_id, url: secure_url };
    await user.save();
  }

  // send response
  return user
    ? res.status(201).send({
        success: true,
        message: "User created successfully",
        results: user,
      })
    : next(new Error("Failed to create user", { cause: 400 }));
});

export const login = asyncHandler(async (req, res, next) => {
  // data
  const { userEmail, userPassword } = req.body;

  // check user existence
  const user = await userModel.findOne({ userEmail });
  if (!user) return next(new Error("User not found!", { cause: 404 }));

  // check userPassword correctness
  const match = bcrypt.compareSync(userPassword, user.userPassword);
  if (!match) return next(new Error("Invalid login data", { cause: 400 }));

  // generate token
  const token = jwt.sign(
    {
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      userPic: user.userPic.url,
    },
    process.env.TOKEN_SIGNATURE,
    { expiresIn: "2d" }
  );

  // save token in DB
  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });

  // send response
  return res.json({
    success: true,
    message: "Logged In Successfully!",
    results: token,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  // data
  let { token } = req.headers;

  // split token
  token = token.split(process.env.BEARER_KEY);

  // make token unValid
  token = await tokenModel.findOneAndUpdate(
    { token },
    {
      isValid: false,
    }
  );

  // send response
  return token
    ? res.json({ success: true, message: "Signed out successfully!" })
    : next(new Error("Sign out failed!"));
});

export const viewAllUsers = asyncHandler(async (req, res, next) => {
  // data
  const { page } = req.query;

  // model keys
  const modelKeys = Object.keys(userModel.schema.paths);

  // fetch users from DB (search fetched users & exclude Admins)
  const users = await userModel
    .find(search(modelKeys, req.query, true))
    .select("userName userEmail userPic")
    .paginate(page);

  // check for no-units
  if (!users.length) return next(new Error("No Users found!", { cause: 404 }));

  // send response
  return res.send({
    success: true,
    message: "List of All Users",
    results: users,
  });
});
