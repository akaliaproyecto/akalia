const router = require('express').Router();

const {
    login, logout, mfaVerify, twoFASetup, twoFAVerifySetup, me
}   = require('../controllers/auth.controller.js');

const { requireAuth } = require('../middlewares/auth');

router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.post('/mfa', requireAuth, mfaVerify);
router.get('/me', requireAuth, me);

// Setup 2FA

router.get('/2fa/setup', requireAuth, twoFASetup);
router.post('/2fa/verify-setup', requireAuth, twoFAVerifySetup);

module.exports = router;