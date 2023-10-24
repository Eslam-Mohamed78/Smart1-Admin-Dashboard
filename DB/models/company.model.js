import mongoose, { Schema, model } from "mongoose";

const companySchema = new Schema(
  {
    companyName: { type: String, },
    companyEmail: {
      type: String,
      unique: true,
      lowercase: true,
    },
    companyImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dayeympjm/image/upload/v1697865841/smart1-admin-dashboard/companies/defaultCompanyImage.png",
      },
      id: {
        type: String,
        default: "smart1-admin-dashboard/companies/defaultCompanyImage",
      },
    },
    companyStatus: {
      type: String,
      default: "activated",
      enum: ["activated", "suspended"],
    },
    // company can work on different units
    unitsIds: [{ type: mongoose.Types.ObjectId, ref: "Unit" }],
  },
  { timestamps: true, strictQuery: true }
);

const companyModel = model("Company", companySchema);

export default companyModel;
