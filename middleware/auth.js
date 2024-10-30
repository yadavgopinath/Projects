const jwt = require('jsonwebtoken');
const User = require('../models/users');

exports.authenticate = (req,res,next)=>{
  
    try{
       
        const token=  req.header('Authorization');
        console.log(token);
        
        const   user = jwt.verify(token,process.env.JWT_SECRET);
       
      
        User.findByPk(user.userId).then(user=>{
            req.user = user;
            next();
        }).catch(err=>{throw new Error(err)})

    }catch(err){
        return res.status(501).json({
            message:'unable to authenticate the token',
            error:err
        })
    }
}
