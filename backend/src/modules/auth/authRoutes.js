const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { verifyToken } = require('../../middlewares/authMiddleware'); 

router.get('/providers', authController.providers);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/sso/login', authController.ssoLogin);
router.get('/sso/callback', authController.ssoCallback);
router.post('/sso/callback', authController.ssoCallback);
router.post('/saml/callback', authController.samlCallback);
router.get('/me', verifyToken, authController.me);

module.exports = router;