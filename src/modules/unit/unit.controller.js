import buildingModel from "../../../DB/models/building.model.js";
import companyModel from "../../../DB/models/company.model.js";
import unitModel from "../../../DB/models/unit.model.js";
import userModel from "../../../DB/models/user.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { search } from "../../utils/queryHelpers.js";

export const viewAllUnits = asyncHandler(async (req, res, next) => {
  // data
  const { page } = req.query;

  // model keys
  const modelKeys = Object.keys(unitModel.schema.paths);

  // fetch units from DB
  const units = await unitModel
    .find(search(modelKeys, req.query)) // to search in Units
    .paginate(page)
    .populate("companyId", "companyName companyEmail companyStatus")
    .populate("usersIds", "userName userEmail")
    .populate({
      path: "buildingId",
      select: "buildingName",
      populate: {
        path: "compoundId",
        select: "compoundName compoundLocation compoundStatus",
      },
    });

  // check for no-units
  if (!units.length) return next(new Error("No Units found!", { cause: 404 }));

  // send response
  return res.send({
    success: true,
    message: "List of All Units",
    results: units,
  });
});

export const addUnit = asyncHandler(async (req, res, next) => {
  // data
  const { unitName, usersIds, buildingId, companyId } = req.body;

  // check unit existence
  const unitExists = await unitModel.findOne({ unitName });
  if (unitExists)
    return next(new Error("Unit already Exists!", { cause: 409 }));

  // check building existence
  const buildingExists = await buildingModel.findById(buildingId);
  if (!buildingExists)
    return next(new Error("Building of the Unit not found!", { cause: 404 }));

  // check company (builder) existence
  const companyExists = await companyModel.findById(companyId);
  if (!companyExists)
    return next(new Error("Company (Builder) not found!", { cause: 404 }));

  // check company (builder) Suspended
  if (companyExists.companyStatus === "suspended")
    return next(
      new Error("Company is Suspended pls Activate first", { cause: 400 })
    );

  // check users (population) existence
  usersIds.map(async (userId) => {
    const userExists = await userModel.findById(userId);
    if (!userExists)
      return next(
        new Error(`User with id (${userId}) not found!`, { cause: 404 })
      );
  });

  // add New Unit
  const unit = await unitModel.create(req.body);

  // add unitId to building units
  await buildingModel.findByIdAndUpdate(
    buildingId,
    { $push: { unitsIds: unit._id } },
    { new: true }
  );

  // add unitId to company units
  await companyModel.findByIdAndUpdate(
    companyId,
    { $push: { unitsIds: unit._id } },
    { new: true }
  );

  // send response
  return unit
    ? res.status(201).send({
        success: true,
        message: "Unit Added Successfully!",
        results: unit,
      })
    : next(new Error("Failed to add the unit!", { cause: 400 }));
});

export const editUnit = asyncHandler(async (req, res, next) => {
  // data
  const { unitName, usersIds, buildingId, companyId } = req.body;
  const { unitId } = req.params;

  // check unit exitence
  const unitExists = await unitModel.findById(unitId);
  if (!unitExists) return next(new Error("Unit not found!", { cause: 404 }));

  // check building existence
  if (buildingId) {
    const buildingExists = await buildingModel.findById(buildingId);
    if (!buildingExists)
      return next(new Error("Building not found!", { cause: 404 }));

    // update buildingId of the unit
    unitExists.buildingId = buildingId;
  }

  // check company existence
  if (companyId) {
    const companyExists = await companyModel.findById(companyId);
    if (!companyExists)
      return next(new Error("Company not found!", { cause: 404 }));

    // update companyId of the unit
    // incase the company is Suspended then assign the Unit to another Company
    unitExists.companyId = companyId;
  }

  // check usersIds existence
  if (usersIds) {
    usersIds.map(async (userId) => {
      const userExists = await userModel.findById(userId);
      if (!userExists)
        return next(
          new Error(`User with id (${userId}) not found!`, { cause: 404 })
        );
    });

    // update usersIds (population) of the unit
    unitExists.usersIds = usersIds;
  }

  // update unitName if given
  if (unitName === "" || unitName) {
    unitExists.unitName = unitName;
  }

  // save all changes to DB
  await unitExists.save();

  // send response
  return res.json({
    success: true,
    message: "Unit Updated Successfully!",
    results: unitExists,
  });
});

export const deleteUnit = asyncHandler(async (req, res, next) => {
  // data
  const { unitId } = req.params;

  // check unit existence then delete if found
  const unit = await unitModel.findByIdAndDelete(unitId);
  if (!unit) return next(new Error("Unit Not found!", { cause: 404 }));

  // delete unit from parent buildingUnits
  await buildingModel.findByIdAndUpdate(unit.buildingId, {
    $pull: { unitsIds: unitId },
  });

  // delete unit from (builder) company
  await companyModel.findByIdAndUpdate(unit.companyId, {
    $pull: { unitsIds: unitId },
  });

  // send response
  return res.json({
    success: true,
    message: "Unit deleted Successfully!",
  });
});
