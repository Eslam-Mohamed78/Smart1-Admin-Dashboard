import { Router } from "express";
import * as authValidation from "./auth.validation.js";
import * as authController from "./auth.controller.js";
import isAuthenticated from "../../middleware/authentication.middleware.js";
import isAuthorized from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";

const router = Router();

// register
router.post(
  "/",
  fileUpload(filterObject.image).single("profilePic"),
  isValid(authValidation.registerSchema),
  authController.register
);

// login
router.post(
  "/login",
  isValid(authValidation.loginSchema),
  authController.login
);

// logOut
router.patch("/logout", isAuthenticated, authController.logout);

// View All Users (not admins)
router.get(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(authValidation.viewAllUsersSchema),
  authController.viewAllUsers
);

export default router;
