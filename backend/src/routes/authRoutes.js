const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateBody } = require('../middleware/validateMiddleware');
const { registerSchema, loginSchema } = require('../validators/authSchemas');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
