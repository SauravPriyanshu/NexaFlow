const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authenticate = require('../../shared/middleware/authenticate');

router.get('/profile', authenticate, userController.getProfile);
router.patch('/profile', authenticate, userController.updateProfile);

module.exports = router;
