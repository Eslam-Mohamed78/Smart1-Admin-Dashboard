import companyModel from "../../../DB/models/company.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import { search } from "../../utils/queryHelpers.js";

export const viewAllCompanies = asyncHandler(async (req, res, next) => {
  // data
  const { page } = req.query;

  // model keys
  const modelKeys = Object.keys(companyModel.schema.paths);

  // fetch companies from DB
  const companies = await companyModel
    .find(search(modelKeys, req.query)) // to search in Companies
    .paginate(page)
    .populate({
      path: "unitsIds",
      select: "unitName",
      populate: {
        path: "buildingId",
        select: "buildingName",
        populate: {
          path: "compoundId",
          select: "compoundName compoundLocation compoundStatus",
        },
      },
    });

  // check for no-companies
  if (!companies.length)
    return next(new Error("No Companies found!", { cause: 404 }));

  // send response
  return res.send({
    success: true,
    message: "List of All Companies",
    results: companies,
  });
});

export const addCompany = asyncHandler(async (req, res, next) => {
  // data
  const { companyName, companyEmail } = req.body;

  // check company exitence
  const companyExists = await companyModel.findOne({ companyEmail });
  if (companyExists)
    return next(new Error("Company Email already exists!", { cause: 409 }));

  // upload company Image to cloudinary
  let secure_url = "";
  let public_id = "";

  if (req.file) {
    const cloudImage = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.CLOUD_FOLDER_NAME}/companies`,
    });

    secure_url = cloudImage.secure_url;
    public_id = cloudImage.public_id;
  }

  // add new company
  const company = await companyModel.create({
    companyName,
    companyEmail,
    companyImage: req.file ? { url: secure_url, id: public_id } : null,
  });

  // send response
  return company
    ? res.status(201).send({
        success: true,
        message: "Company Added Successfully!",
        results: company,
      })
    : next(new Error("Failed to add the company!", { cause: 400 }));
});

export const editCompany = asyncHandler(async (req, res, next) => {
  // data
  const { companyName, companyEmail, unitsIds } = req.body;
  const { companyId } = req.params;

  // check company exitence
  const companyExists = await companyModel.findById(companyId);
  if (!companyExists)
    return next(new Error("Company not found!", { cause: 404 }));

  // check unitsIds existence
  if (unitsIds) {
    unitsIds.map(async (unitId) => {
      const unitExists = await buildingModel.findById(unitId);
      if (!unitExists)
        return next(
          new Error(`Unit with id (${unitId}) not found!`, {
            cause: 404,
          })
        );
    });

    // update unitsIds (population) of the unit
    companyExists.unitsIds = unitsIds;
  }

  // update company Image if given
  if (req.file) {
    const isCurrImgDefault = companyExists.companyImage.id.startsWith(
      "smart1-admin-dashboard/companies/default"
    );

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        ...(!isCurrImgDefault
          ? { public_id: companyExists.companyImage.id }
          : {}),
        ...(isCurrImgDefault
          ? { folder: `${process.env.CLOUD_FOLDER_NAME}/companies` }
          : {}),
      }
    );

    // update new url / note: id is the same
    companyExists.companyImage.url = secure_url;
    companyExists.companyImage.id = public_id;
  }

  // update companyName if given
  if (companyName) {
    companyExists.companyName = companyName;
  }

  // update companyEmail if given
  if (companyEmail) {
    companyExists.companyEmail = companyEmail;
  }

  // save all changes to DB
  await companyExists.save();

  // send response
  return res.json({
    success: true,
    message: "Company Updated Successfully!",
    results: companyExists,
  });
});

export const suspendOrActivateCompany = asyncHandler(async (req, res, next) => {
  // data
  const { status } = req.body;
  const { companyId } = req.params;

  // check company existence
  const companyExists = await companyModel.findById(companyId);
  if (!companyExists)
    return next(new Error("Company Not found!", { cause: 404 }));

  // the warning before Suspending or Activation should be
  // handled in the Frontend side As the "Companies" section
  // presents all company data including lower layers as fetched
  // in "View List of All Companies" request.

  // suspend company
  if (companyExists.companyStatus === "activated") {
    if (status === "activate")
      return next(new Error("Company already Activated!", { cause: 400 }));

    companyExists.companyStatus = "suspended";
    await companyExists.save();

    return res.json({
      success: true,
      message: "Company Suspended Successfully!",
      results: companyExists,
    });
  }

  // activate company
  if (companyExists.companyStatus === "suspended") {
    if (status === "suspend")
      return next(new Error("Company already Suspended!", { cause: 400 }));

    companyExists.companyStatus = "activated";
    await companyExists.save();

    return res.json({
      success: true,
      message: "Company Activated Successfully!",
      results: companyExists,
    });
  }
});

export const deleteCompany = asyncHandler(async (req, res, next) => {
  // data
  const { companyId } = req.params;

  // check company existence
  const company = await companyModel.findByIdAndDelete(companyId);
  if (!company) return next(new Error("Company Not found!", { cause: 404 }));

  // send response
  return res.json({
    success: true,
    message: "Company deleted Successfully!",
  });
});
