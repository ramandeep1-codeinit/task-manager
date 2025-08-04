import { registerValidation, loginValidation } from '../validator/user.validation.js';



export const registerUser = async (req, res) => {
  try {
    // Validate input
    const { error } = registerValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error during registration', error: err.message });
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