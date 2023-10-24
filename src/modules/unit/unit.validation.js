import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const viewAllUnitsShema = joi
  .object({
    unitName: joi.string().allow("").max(30),
    page: joi.number().integer().min(0),
  })
  .required();

export const addUnitShema = joi
  .object({
    unitName: joi.string().allow("").max(30).required(),
    usersIds: joi
      .array()
      .allow("")
      .items(joi.string().custom(isValidObjectId))
      .required(),
    buildingId: joi.string().custom(isValidObjectId).required(),
    companyId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

export const editUnitShema = joi
  .object({
    unitId: joi.string().custom(isValidObjectId).required(),
    unitName: joi.string().allow("").max(30),
    usersIds: joi.array().min(1).items(joi.string().custom(isValidObjectId)),
    buildingId: joi.string().custom(isValidObjectId),
    companyId: joi.string().custom(isValidObjectId),
  })
  .required();

export const deleteUnitShema = joi
  .object({
    unitId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
