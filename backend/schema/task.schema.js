import Joi from 'joi';
import mongoose from 'mongoose';

export const taskValidationSchema = Joi.object({
  userName: Joi.string().required().label('User Name'),

  project: Joi.string().required().label('Project'),

  taskDetail: Joi.string().required().label('Task Detail'),

  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .default('pending')
    .label('Status'),

  userId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message('Invalid user ID');
      }
      return value;
    })
    .required()
    .label('User ID'),
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