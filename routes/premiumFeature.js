const express = require('express');
const authenticatemidleware = require('../middleware/auth');
const premiumfeaturecontroller = require('../controllers/premiumfeature');
const router = express.Router();
router.get('/showLeaderBoard',authenticatemidleware.authenticate,premiumfeaturecontroller.getUserLeaderBoard);

module.exports = router;
