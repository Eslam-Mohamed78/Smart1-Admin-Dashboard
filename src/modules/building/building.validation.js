import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

export const viewAllBuildingsShema = joi
  .object({
    buildingName: joi.string().allow("").max(30),
    page: joi.number().integer().min(0),
  })
  .required();

export const addBuildingShema = joi
  .object({
    buildingName: joi.string().allow("").max(30).required(),
    compoundId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

export const editBuildingShema = joi
  .object({
    buildingId: joi.string().custom(isValidObjectId).required(),
    buildingName: joi.string().allow("").max(30),
    compoundId: joi.string().custom(isValidObjectId),
    unitsIds: joi.array().min(1).items(joi.string().custom(isValidObjectId)),
  })
  .required();

export const deleteBuildingShema = joi
  .object({
    buildingId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
