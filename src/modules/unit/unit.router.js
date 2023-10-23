import { Router } from "express";
import * as unitController from "./unit.controller.js";
import * as unitValidation from "./unit.validation.js";
import isAuthenticated from "../../middleware/authentication.middleware.js";
import isAuthorized from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";

const router = Router();

// UC-015: View List of All Units
router.get(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(unitValidation.viewAllUnitsShema),
  unitController.viewAllUnits
);

// UC-016: Add New Unit
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(unitValidation.addUnitShema),
  unitController.addUnit
);

// UC-017: Admin Edits Unit
router.patch(
  "/:unitId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(unitValidation.editUnitShema),
  unitController.editUnit
);

// UC-018: Admin Deletes Unit
router.delete(
  "/:unitId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(unitValidation.deleteUnitShema),
  unitController.deleteUnit
);

export default router;
