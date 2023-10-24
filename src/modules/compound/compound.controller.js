import buildingModel from "../../../DB/models/building.model.js";
import unitModel from "../../../DB/models/unit.model.js";
import compoundModel from "../../../DB/models/compound.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import { search } from "../../utils/queryHelpers.js";

export const viewAllCompounds = asyncHandler(async (req, res, next) => {
  // data
  const { page } = req.query;

  // model keys
  const modelKeys = Object.keys(compoundModel.schema.paths);

  // fetch compounds from DB
  const compounds = await compoundModel
    .find(search(modelKeys, req.query)) // to search in Compounds
    .paginate(page)
    .populate({
      path: "buildingsIds",
      select: "buildingName",
      populate: {
        path: "unitsIds",
        select: "unitName",
        populate: {
          path: "companyId",
          select: "companyName companyEmail companyStatus",
        },
      },
    });

  // check for no-units
  if (!compounds.length)
    return next(new Error("No Compounds found!", { cause: 404 }));

  // send response
  return res.send({
    success: true,
    message: "List of All Compounds",
    results: compounds,
  });
});

export const addCompound = asyncHandler(async (req, res, next) => {
  // data
  const { compoundName, compoundLocation } = req.body;

  // check compound existence
  const compoundExists = await compoundModel.findOne({ compoundName });
  if (compoundExists)
    return next(new Error("Compound already Exists!", { cause: 409 }));

  // upload compound Image to cloudinary
  let secure_url = "";
  let public_id = "";

  if (req.file) {
    const cloudImage = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.CLOUD_FOLDER_NAME}/compounds`,
    });

    secure_url = cloudImage.secure_url;
    public_id = cloudImage.public_id;
  }

  // add New compound
  const compound = await compoundModel.create({
    compoundName,
    compoundLocation,
    compoundImage: req.file ? { url: secure_url, id: public_id } : null,
  });

  // send response
  return compound
    ? res.status(201).send({
        success: true,
        message: "Compound Added Successfully!",
        results: compound,
      })
    : next(new Error("Failed to add the Compound!", { cause: 400 }));
});

export const editCompound = asyncHandler(async (req, res, next) => {
  // data
  const { compoundName, compoundLocation, buildingsIds } = req.body;
  const { compoundId } = req.params;

  // check Building exitence
  const compoundExists = await compoundModel.findById(compoundId);
  if (!compoundExists)
    return next(new Error("Compound not found!", { cause: 404 }));

  // update compound Image if given
  if (req.file) {
    const isCurrImgDefault = compoundExists.compoundImage.id.startsWith(
      "smart1-admin-dashboard/compounds/default"
    );

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        ...(!isCurrImgDefault
          ? { public_id: compoundExists.compoundImage.id }
          : {}),
        ...(isCurrImgDefault
          ? { folder: `${process.env.CLOUD_FOLDER_NAME}/compounds` }
          : {}),
      }
    );

    // update new url / note: id is the same
    compoundExists.compoundImage.url = secure_url;
    compoundExists.compoundImage.id = public_id;
  }

  // check buildingsIds existence
  if (buildingsIds) {
    buildingsIds.map(async (buildingId) => {
      const buildingExists = await buildingModel.findById(buildingId);
      if (!buildingExists)
        return next(
          new Error(`Building with id (${buildingId}) not found!`, {
            cause: 404,
          })
        );
    });

    // update buildingsIds (population) of the unit
    compoundExists.buildingsIds = buildingsIds;
  }

  // update compoundName if given
  if (compoundName === "" || compoundName) {
    compoundExists.compoundName = compoundName;
  }

  // update compoundLocation if given
  if (compoundLocation === "" || compoundLocation) {
    compoundExists.compoundLocation = compoundLocation;
  }

  // save all changes to DB
  await compoundExists.save();

  // send response
  return res.json({
    success: true,
    message: "Compound Updated Successfully!",
    results: compoundExists,
  });
});

export const suspendOrActivateCompound = asyncHandler(
  async (req, res, next) => {
    // data
    const { status } = req.body;
    const { compoundId } = req.params;

    // check compound existence
    const compoundExists = await compoundModel.findById(compoundId);
    if (!compoundExists)
      return next(new Error("Compound Not found!", { cause: 404 }));

    // the warning before Suspending or Activation should be
    // handled in the Frontend side As the "Compounds" section
    // presents all compound data including lower layers as fetched
    // in "View List of All Compounds" request.

    // suspend compound
    if (compoundExists.compoundStatus === "activated") {
      if (status === "activate")
        return next(new Error("Compound already Activated!", { cause: 400 }));

      compoundExists.compoundStatus = "suspended";
      await compoundExists.save();

      return res.json({
        success: true,
        message: "Compound Suspended Successfully!",
        results: compoundExists,
      });
    }

    // activate compound
    if (compoundExists.compoundStatus === "suspended") {
      if (status === "suspend")
        return next(new Error("Compound already Suspended!", { cause: 400 }));

      compoundExists.compoundStatus = "activated";
      await compoundExists.save();

      return res.json({
        success: true,
        message: "Compound Activated Successfully!",
        results: compoundExists,
      });
    }
  }
);

export const deleteCompound = asyncHandler(async (req, res, next) => {
  // data
  const { compoundId } = req.params;

  // check compound existence then delete if found
  const compound = await compoundModel.findByIdAndDelete(compoundId);
  if (!compound) return next(new Error("Compound Not found!", { cause: 404 }));

  // delete child buildings & buildingUnits of deleted compound
  compound.buildingsIds.map(async (buildingId) => {
    const deletedBuilding = await buildingModel.findByIdAndDelete(buildingId);

    deletedBuilding.unitsIds.map(async (unitId) => {
      const deletedUnit = await unitModel.findByIdAndDelete(unitId);
    });
  });

  // send response
  return res.json({
    success: true,
    message: "Compound deleted Successfully!",
  });
});
