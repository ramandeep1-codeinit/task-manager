import { registerValidation, loginValidation } from '../schema/user.schema.js';
import User from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: req.body.email  });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }else{

       const salt = await bcrypt.genSalt(10)
       const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
      email,
      password: hashedPassword,
      role,
    });

    await user.save();  

    res.status(201).json({ message: "User registered successfully", userId: user._id });
    }

    
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
    if (error) {
      return res.status(400).json({ message: "Validation failed", error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email, role: existingUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // valid for 30 days
    );


    // Success (Optionally return JWT token here)
    return res.status(200).json({
      message: "Login successful",
       token,
      user: {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role, // Assuming you have a name field
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error during login", error: err.message });
  }
};