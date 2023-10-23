import { Router } from "express";
import * as buildingController from "./building.controller.js";
import * as buildingValidation from "./building.validation.js";
import isAuthenticated from "../../middleware/authentication.middleware.js";
import isAuthorized from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";

const router = Router();

// UC-011: View List of All Buildings
router.get(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(buildingValidation.viewAllBuildingsShema),
  buildingController.viewAllBuildings
);

// UC-012: Add New Building
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(buildingValidation.addBuildingShema),
  buildingController.addBuilding
);

// UC-013: Admin Edits Building
router.patch(
  "/:buildingId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(buildingValidation.editBuildingShema),
  buildingController.editBuilding
);

// UC-014: Admin Deletes Building
router.delete(
  "/:buildingId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(buildingValidation.deleteBuildingShema),
  buildingController.deleteBuilding
);

export default router;
