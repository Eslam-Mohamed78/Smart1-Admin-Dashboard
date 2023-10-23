import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    userName: { type: String, required: true, min: 3, max: 20 },
    userEmail: { type: String, required: true, lowercase: true },
    userPassword: { type: String, required: true },
    userPic: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dayeympjm/image/upload/v1697865805/smart1-admin-dashboard/admins/defaultProfilePicture.png",
      },
      id: {
        type: String,
        default: "smart1-admin-dashboard/admins/defaultProfilePicture",
      },
    },
    role: {
      type: String,
      default: "user",
      enum: ["admin", "user"],
    },
  },
  { timestamps: true }
);

/********* Pre Hook (mongoose middleware) *********/
// hash password
userSchema.pre("save", function () {
  if (this.isModified("userPassword")) {
    this.userPassword = bcrypt.hashSync(
      this.userPassword,
      Number(process.env.SALT_ROUND)
    );
  }
});

const userModel = model("User", userSchema);

export default userModel;
