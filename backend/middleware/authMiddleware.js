import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // adjust path if needed

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken; // same cookie name you used in login

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next(); // ✅ Continue to next middleware or controller
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
