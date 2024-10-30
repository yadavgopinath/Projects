const express = require('express');
const router = express.Router();

const forgotpasscontroler= require('../controllers/forgotpassword');

router.post('/forgotpassword',forgotpasscontroler.forgotpassword);
router.get('/resetpassword/:uuid',forgotpasscontroler.checkresetpassword);
router.post('/resetpassword/:uuid',forgotpasscontroler.finalresetpassword);
module.exports=router;