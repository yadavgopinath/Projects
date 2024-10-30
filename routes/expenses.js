const express = require('express');
 const router= express.Router();
 const controller = require('../controllers/expenses');
 const userAuthentication = require('../middleware/auth');

 router.post('/addexpenses',userAuthentication.authenticate,controller.addexpenses);
 router.get('/getexpense',userAuthentication.authenticate,controller.getexpenses);
 router.get('/download',userAuthentication.authenticate,controller.downloadexpenses);
 router.get('/previousdownloads',userAuthentication.authenticate,controller.previousdownloads);


 router.delete('/delete-expense/:expid',userAuthentication.authenticate,controller.deleteexpenses);
 router.put('/update-expense/:expid',userAuthentication.authenticate,controller.editexpenses);

 module.exports = router;