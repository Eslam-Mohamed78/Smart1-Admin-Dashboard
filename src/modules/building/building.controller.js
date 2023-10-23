import buildingModel from "../../../DB/models/building.model.js";
import compoundModel from "../../../DB/models/compound.model.js";
import unitModel from "../../../DB/models/unit.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { search } from "../../utils/queryHelpers.js";

export const viewAllBuildings = asyncHandler(async (req, res, next) => {
  // data
  const { page } = req.query;

  // model keys
  const modelKeys = Object.keys(buildingModel.schema.paths);

  // fetch buildings from DB
  const buildings = await buildingModel
    .find(search(modelKeys, req.query)) // to search in Buildings
    .paginate(page)
    .populate("compoundId", "compoundName compoundLocation compoundStatus")
    .populate({
      path: "unitsIds",
      select: "unitName",
      populate: {
        path: "companyId",
        select: "companyName companyEmail companyStatus",
      },
    });

  // check for no-units
  if (!buildings.length)
    return next(new Error("No Buildings found!", { cause: 404 }));

  // send response
  return res.send({
    success: true,
    message: "List of All Buildings",
    results: buildings,
  });
});

export const addBuilding = asyncHandler(async (req, res, next) => {
  // data
  const { buildingName, compoundId } = req.body;

  // check building existence
  const buildingExists = await buildingModel.findOne({ buildingName });
  if (buildingExists)
    return next(new Error("Building already Exists!", { cause: 409 }));

  // check compound existence
  const compoundExists = await compoundModel.findById(compoundId);
  if (!compoundExists)
    return next(
      new Error("Compound of the Building not found!", { cause: 404 })
    );

  // check compound Suspended
  if (compoundExists.compoundStatus === "suspended")
    return next(
      new Error("Compound is Suspended pls Activate first", { cause: 400 })
    );

  // add New Building
  const building = await buildingModel.create(req.body);

  // add buildingId to compound buildings
  await compoundModel.findByIdAndUpdate(
    compoundId,
    { $push: { buildingsIds: building._id } },
    { new: true }
  );

  // send response
  return building
    ? res.status(201).send({
        success: true,
        message: "Building Added Successfully!",
        results: building,
      })
    : next(new Error("Failed to add the building!", { cause: 400 }));
});

export const editBuilding = asyncHandler(async (req, res, next) => {
  // data
  const { buildingName, compoundId, unitsIds } = req.body;
  const { buildingId } = req.params;

  // check Building exitence
  const buildingExists = await buildingModel.findById(buildingId);
  if (!buildingExists)
    return next(new Error("Building not found!", { cause: 404 }));

  // check compound existence
  if (compoundId) {
    const compoundExists = await compoundModel.findById(compoundId);
    if (!compoundExists)
      return next(new Error("Compound not found!", { cause: 404 }));

    // update compoundId of the building
    // incase the Compound is Suspended then assign the Building to another Compound
    buildingExists.compoundId = compoundId;
  }

  // check unitsIds existence
  if (unitsIds) {
    unitsIds.map(async (unitId) => {
      const unitExists = await unitModel.findById(unitId);
      if (!unitExists)
        return next(
          new Error(`Unit with id (${unitId}) not found!`, { cause: 404 })
        );
    });

    // update unitsIds (population) of the unit
    buildingExists.unitsIds = unitsIds;
  }

  // update buildingName if given
  if (buildingName) {
    buildingExists.buildingName = buildingName;
  }

  // save all changes to DB
  await buildingExists.save();

  // send response
  return res.json({
    success: true,
    message: "Building Updated Successfully!",
    results: buildingExists,
  });
});

export const deleteBuilding = asyncHandler(async (req, res, next) => {
  // data
  const { buildingId } = req.params;

  // check building existence
  const building = await buildingModel.findByIdAndDelete(buildingId);
  if (!building) return next(new Error("Building Not found!", { cause: 404 }));

  // delete child units of deleted building
  building.unitsIds.map(async (unitId) => {
    const deletedUnit = await unitModel.findByIdAndDelete(unitId);
  });

  // send response
  return res.json({
    success: true,
    message: "Building deleted Successfully!",
  });
});
