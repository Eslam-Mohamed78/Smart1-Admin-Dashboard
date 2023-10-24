import joi from "joi";

export const registerSchema = joi
  .object({
    userName: joi.string().allow("").max(20).required(),
    userEmail: joi.string().email().allow("").required(),
    userPassword: joi
      .string()
      .regex(/^[A-Z][a-z0-9]{4,10}$/)
      .required(),
    confirmPassword: joi.string().valid(joi.ref("userPassword")).required(),
  })
  .required();

export const loginSchema = joi
  .object({
    userEmail: joi.string().email().allow("").required(),
    userPassword: joi.string().required(),
  })
  .required();

export const viewAllUsersSchema = joi
  .object({
    userName: joi.string().allow("").max(20),
    userEmail: joi.string().allow(""),
    page: joi.number().integer().min(0),
  })
  .required();
