const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const config = require('../config');
const { AppError } = require('../utils/errors');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

const registerUser = async ({ name, email, password, role = 'safety_officer' }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check existing user
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    throw new AppError('An account with this email address already exists.', 409, 'EMAIL_ALREADY_EXISTS');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const id = uuidv4();

  await db.query(
    `INSERT INTO users (id, name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, name.trim(), normalizedEmail, passwordHash, role]
  );

  const user = {
    id,
    name: name.trim(),
    email: normalizedEmail,
    role,
  };

  const token = generateToken(user);

  return { user, token };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await db.query(
    'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1',
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };

  const token = generateToken(sanitizedUser);

  return { user: sanitizedUser, token };
};

const getUserById = async (id) => {
  const result = await db.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  return result.rows[0];
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
