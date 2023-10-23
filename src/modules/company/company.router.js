import { Router } from "express";
import * as companyController from "./company.controller.js";
import * as companyValidation from "./company.validation.js";
import isAuthenticated from "../../middleware/authentication.middleware.js";
import isAuthorized from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";

const router = Router();

// UC-001: View List of All Companies
router.get(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(companyValidation.viewAllCompaniesShema),
  companyController.viewAllCompanies
);

// UC-002: Add New Company
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("companyImage"),
  isValid(companyValidation.addCompanyShema),
  companyController.addCompany
);

// UC-003: Admin Edits Company
router.patch(
  "/:companyId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("companyImage"),
  isValid(companyValidation.editCompanyShema),
  companyController.editCompany
);

// UC-004: Admin Suspends/Activates Company
router.put(
  "/:companyId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(companyValidation.suspendOrActivateCompanyShema),
  companyController.suspendOrActivateCompany
);

// UC-005: Admin Deletes Company
router.delete(
  "/:companyId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(companyValidation.deleteCompanyShema),
  companyController.deleteCompany
);

export default router;
