const express = require ('express');
const router = express.Router();
const controller=require('../controllers/users');

router.post('/signup',controller.addUsers);
router.post('/login',controller.checkUser);


module.exports=router;