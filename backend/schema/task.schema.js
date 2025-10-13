import Joi from "joi";
import mongoose from "mongoose";

export const taskValidationSchema = Joi.object({
  body: Joi.object({
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

export const taskUpdateValidationSchema = Joi.object({

  project: Joi.string().optional().label('Project'),

  taskDetail: Joi.string().optional().label('Task Detail'),

  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .default('pending')
    .label('Status'),

  userId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message('Invalid user ID');
      }
      return value;
    })
    .optional()
    .label('User ID'),
});




// import Joi from "joi";
// import mongoose from "mongoose";

// // For creating a task (Manager)
// export const taskValidationSchema = Joi.object({
//   projectId: Joi.string()
//     .custom((value, helpers) => {
//       if (!mongoose.Types.ObjectId.isValid(value)) {
//         return helpers.message("Invalid project ID");
//       }
//       return value;
//     })
//     .required(),
//   taskDetail: Joi.string().required(),
//   userId: Joi.string()
//     .custom((value, helpers) => {
//       if (!mongoose.Types.ObjectId.isValid(value)) {
//         return helpers.message("Invalid user ID");
//       }
//       return value;
//     })
//     .optional(), // optional if manager assigns later
//   status: Joi.string()
//     .valid("pending", "in-progress", "completed")
//     .optional()
//     .default("pending"),
// });

// // For updating a task
// export const taskUpdateValidationSchema = Joi.object({
//   projectId: Joi.string()
//     .custom((value, helpers) => {
//       if (!mongoose.Types.ObjectId.isValid(value)) {
//         return helpers.message("Invalid project ID");
//       }
//       return value;
//     })
//     .optional(),
//   taskDetail: Joi.string().optional(),
//   userId: Joi.string()
//     .custom((value, helpers) => {
//       if (!mongoose.Types.ObjectId.isValid(value)) {
//         return helpers.message("Invalid user ID");
//       }
//       return value;
//     })
//     .optional(),
//   status: Joi.string()
//     .valid("pending", "in-progress", "completed")
//     .optional(),
// });
