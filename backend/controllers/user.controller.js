import { registerValidation, loginValidation } from '../schema/user.schema.js';
import User from "../models/user.model.js"
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      role,
    });

    await user.save();  

    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  try {
    // Validate input
    const { error } = loginValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;

    // Check if user exists
    const user = await user.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};