import mongoose, { Schema, model } from "mongoose";

const unitSchema = new Schema(
  {
    unitName: {
      type: String,
      unique: true,
    },
    // unit can have multi users
    usersIds: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    // unit belong to specific building
    buildingId: {
      type: mongoose.Types.ObjectId,
      ref: "Building",
      required: true,
    },
    // unit is developed by specific company
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true, strictQuery: true }
);

const unitModel = model("Unit", unitSchema);

export default unitModel;
