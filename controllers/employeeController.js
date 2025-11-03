const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Employee } = require('../models');

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);
const TOKEN_TTL = process.env.JWT_TTL || '1h';

const buildToken = (employeeId) => {
  return jwt.sign({ id: employeeId }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  try {
    const existing = await Employee.findOne({ where: { email } });

    if (existing) {
      return res.status(409).json({ message: 'An account already exists for this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const employee = await Employee.create({
      name,
      email,
      password: hashedPassword,
    });

    // Returning minimal details here; the UI can hit login to get the token when ready.
    return res.status(201).json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
    });
  } catch (error) {
    console.error('Employee registration failed:', error);
    return res.status(500).json({ message: 'Could not register employee.', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are both required.' });
  }

  try {
    const employee = await Employee.findOne({ where: { email } });

    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatches = await bcrypt.compare(password, employee.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET is missing; refusing to issue token.');
      return res.status(500).json({ message: 'Server misconfiguration.' });
    }

    const token = buildToken(employee.id);

    return res.status(200).json({
      token,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
      },
    });
  } catch (error) {
    console.error('Employee login failed:', error);
    return res.status(500).json({ message: 'Unable to login right now.', error: error.message });
  }
};

module.exports = {
  register,
  login,
};
