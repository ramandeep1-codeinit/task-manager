
import Task from '../models/task.model.js';
import { taskValidationSchema } from '../schema/task.schema.js';


export const createTask = async (req, res) => {
  const { error } = taskValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
