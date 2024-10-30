const express = require('express');

const router = express.Router();

const purchaseController = require('../controllers/purchase');

const authenticatemid = require('../middleware/auth');

router.get('/premiummembership',authenticatemid.authenticate,purchaseController.prchasepremium);

router.post('/updatetransactionstatus',authenticatemid.authenticate,purchaseController.updatetransactionstatus);

module.exports =router;
