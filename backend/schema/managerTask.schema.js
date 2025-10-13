import Joi from "joi";
import mongoose from "mongoose";

export const managerTaskValidationSchema = Joi.object({
  project: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid project ID");
      }
      return value;
    }),
  taskDetail: Joi.string().required(),
  userId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid manager ID");
      }
      return value;
    }),
});
