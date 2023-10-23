import mongoose, { Schema, model } from "mongoose";

const compoundSchema = new Schema(
  {
    compoundName: {
      type: String,
      min: 5,
      max: 30,
      unique: true,
      required: true,
    },
    compoundLocation: { type: String, required: true },
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
      default: "suspended",
      enum: ["activated", "suspended"],
    },
    // compound can have multi buildings
    buildingsIds: [{ type: mongoose.Types.ObjectId, ref: "Building" }],
  },
  { timestamps: true, strictQuery: true }
);

const compoundModel = model("Compound", compoundSchema);

export default compoundModel;
