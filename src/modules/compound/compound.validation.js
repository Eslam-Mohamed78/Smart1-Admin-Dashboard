import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const viewAllCompoundsShema = joi
  .object({
    compoundName: joi.string().allow("").max(30),
    page: joi.number().integer().min(0),
  })
  .required();

export const addCompoundShema = joi
  .object({
    compoundName: joi.string().allow("").max(30).required(),
    compoundLocation: joi.string().allow("").required(),
  })
  .required();

export const editCompoundShema = joi
  .object({
    compoundId: joi.string().custom(isValidObjectId).required(),
    compoundName: joi.string().allow("").max(30),
    compoundLocation: joi.string().allow(""),
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
