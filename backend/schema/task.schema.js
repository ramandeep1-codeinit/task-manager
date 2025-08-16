import Joi from "joi";
import mongoose from "mongoose";

export const taskValidationSchema = Joi.object({
  body: Joi.object({
    userName: Joi.string(),
    project: Joi.string().required(),
    taskDetail: Joi.string().required(),
    status: Joi.string()
      .valid("pending", "in-progress", "completed")
      .default("pending"),
    userId: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.message("Invalid user ID");
        }
        return value;
      })
      .required(),
  }),
});
// export const taskUpdateValidationSchema = Joi.object({
//   userName: Joi.string().optional().label('User Name'),

//   project: Joi.string().optional().label('Project'),

//   taskDetail: Joi.string().optional().label('Task Detail'),

//   status: Joi.string()
//     .valid('pending', 'in-progress', 'completed')
//     .optional()
//     .default('pending')
//     .label('Status'),

//   userId: Joi.string()
//     .custom((value, helpers) => {
//       if (!mongoose.Types.ObjectId.isValid(value)) {
//         return helpers.message('Invalid user ID');
//       }
//       return value;
//     })
//     .optional()
//     .label('User ID'),
// });
