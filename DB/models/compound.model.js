import mongoose, { Schema, model } from "mongoose";

const compoundSchema = new Schema(
  {
    compoundName: {
      type: String,
      unique: true,
    },
    compoundLocation: {
      type: String,
    },
    compoundImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dayeympjm/image/upload/v1697885667/smart1-admin-dashboard/compounds/defaultCompoundImage.jpg",
      },
      id: {
        type: String,
        default: "smart1-admin-dashboard/compounds/defaultCompoundImage",
      },
    },
    compoundStatus: {
      type: String,
      default: "activated",
      enum: ["activated", "suspended"],
    },
    // compound can have multi buildings
    buildingsIds: [{ type: mongoose.Types.ObjectId, ref: "Building" }],
  },
  { timestamps: true, strictQuery: true }
);

const compoundModel = model("Compound", compoundSchema);

export default compoundModel;
