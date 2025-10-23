import Joi from "joi";
import mongoose from "mongoose";

export const taskDetailValidationSchema = Joi.object({
  project: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid project ID");
      }
      return value;
    }),
  taskDetail: Joi.string().required(),
  createdBy: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid manager ID");
      }
      return value;
    }),
  assignedTo: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid assigned user ID");
      }
      return value;
    }),
  dueDate: Joi.date().optional(),
});
