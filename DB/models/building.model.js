import mongoose, { Schema, model } from "mongoose";

const buildingSchema = new Schema(
  {
    buildingName: {
      type: String,
      min: 5,
      max: 30,
      unique: true,
      required: true,
    },
    // building belong to specific compound
    compoundId: {
      type: mongoose.Types.ObjectId,
      ref: "Compound",
      required: true,
    },
    // building can have multi units
    unitsIds: [{ type: mongoose.Types.ObjectId, ref: "Unit" }],
  },
  { timestamps: true, strictQuery: true }
);

const buildingModel = model("Building", buildingSchema);

export default buildingModel;
