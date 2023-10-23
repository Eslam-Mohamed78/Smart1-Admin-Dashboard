import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const viewAllCompaniesShema = joi
  .object({
    companyName: joi.string().max(30),
    page: joi.number().integer().min(0),
  })
  .required();

export const addCompanyShema = joi
  .object({
    companyName: joi.string().min(5).max(30).required(),
    companyEmail: joi.string().email().required(),
  })
  .required();

export const editCompanyShema = joi
  .object({
    companyId: joi.string().custom(isValidObjectId).required(),
    companyName: joi.string().min(5).max(30),
    companyEmail: joi.string().email(),
    unitsIds: joi.array().min(1).items(joi.string().custom(isValidObjectId)),
  })
  .required();

export const suspendOrActivateCompanyShema = joi
  .object({
    companyId: joi.string().custom(isValidObjectId).required(),
    status: joi.string().valid("activate", "suspend").required(),
  })
  .required();

export const deleteCompanyShema = joi
  .object({
    companyId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
