import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const viewAllCompoundsShema = joi
  .object({
    compoundName: joi.string().max(30),
    page: joi.number().integer().min(0),
  })
  .required();

export const addCompoundShema = joi
  .object({
    compoundName: joi.string().min(5).max(30).required(),
    compoundLocation: joi.string().required(),
  })
  .required();

export const editCompoundShema = joi
  .object({
    compoundId: joi.string().custom(isValidObjectId).required(),
    compoundName: joi.string().min(5).max(30),
    compoundLocation: joi.string(),
    buildingsIds: joi
      .array()
      .min(1)
      .items(joi.string().custom(isValidObjectId)),
  })
  .required();

export const suspendOrActivateCompoundShema = joi
  .object({
    compoundId: joi.string().custom(isValidObjectId).required(),
    status: joi.string().valid("activate", "suspend").required(),
  })
  .required();

export const deleteCompoundShema = joi
  .object({
    compoundId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
