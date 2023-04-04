require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const registerUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({ email, password, name, role });
    await newUser.save();

    const refreshToken = jwt.sign({ userId: newUser._id, role: role }, process.env.REFRESH_TOKEN_SECRET);
    await User.updateOne({ email: email }, { refreshToken: refreshToken })

    // Generate JWT token
    const accessToken = generateAccessToken(newUser);

    res.status(201).json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isPasswordCorrect = await existingUser.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT accessToken
    const accessToken = generateAccessToken(existingUser);

    res.status(200).json({ accessToken: accessToken, refreshToken: existingUser.refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

function generateAccessToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
}

const generateNewAccessToken = (req, res) => {
  const refreshToken = req.body.token;
  jwt.decode(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decode) => {
    if (err) {
      res.status(400).json({ error: err })
    }
    const accessToken = generateAccessToken(decode);
    return res.status(200).json({ accessToken: accessToken })

  })

}


module.exports = { registerUser, loginUser, generateNewAccessToken };