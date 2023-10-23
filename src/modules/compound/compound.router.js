import { Router } from "express";
import * as compoundController from "./compound.controller.js";
import * as compoundValidation from "./compound.validation.js";
import isAuthenticated from "../../middleware/authentication.middleware.js";
import isAuthorized from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";

const router = Router();

// UC-006: View List of All Compounds
router.get(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(compoundValidation.viewAllCompoundsShema),
  compoundController.viewAllCompounds
);

// UC-007: Add New Compound
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("compoundImage"),
  isValid(compoundValidation.addCompoundShema), 
  compoundController.addCompound
);

// UC-008: Admin Edits Compound
router.patch(
  "/:compoundId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("compoundImage"),
  isValid(compoundValidation.editCompoundShema),
  compoundController.editCompound
);

// UC-009: Admin Suspends/Activates Compound
router.put(
  "/:compoundId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(compoundValidation.suspendOrActivateCompoundShema),
  compoundController.suspendOrActivateCompound
);

// UC-010: Admin Deletes Compound
router.delete(
  "/:compoundId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(compoundValidation.deleteCompoundShema),
  compoundController.deleteCompound
);

export default router;
