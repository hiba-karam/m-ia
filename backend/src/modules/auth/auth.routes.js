const express = require('express');
const { login, ssoLogin, ssoCallback, samlCallback, me, providers } = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/providers', providers);
router.post('/login', login);
router.get('/sso/login', ssoLogin);
router.get('/sso/callback', ssoCallback);
router.post('/sso/callback', ssoCallback);
router.post('/saml/callback', samlCallback);
router.get('/me', authenticate(), me);

module.exports = router;
