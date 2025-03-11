const Users = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.addUsers = async(req,res,next) =>{
try{
    const {name,email,password } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Bad Parameter: Something is missing' });
      }

      const existingUser = await Users.findOne( { email} );
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

      const saltrounds=10;
     
bcrypt.hash(password,saltrounds,async(err,hash)=>{
   
   
   const newUser=new Users({
    name,
    email:email.toLowerCase(),
    password:hash
   });

   await newUser.save();

     res.status(200).json({
        message:"user added successfully ",
        
     });

})
}catch(err){
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error' });
}

};

exports.generateAccessToken = function(user){
   
    return jwt.sign({userId:user._id.toString(),name:user.name,isPremiumUser:user.isPremiumUser},'secretkey');
}



exports.checkUser = async(req,res,next)=>{

    const {email,password} = req.body;
try{


    const userPresent=await Users.findOne({email});

    if(userPresent){
        bcrypt.compare(password,userPresent.password,(err,result)=>{
            if(err)
            {
                throw new Error('Something Went Wrong');
            }
            if(result===true)
            {
                
                const token = exports.generateAccessToken(userPresent);  // Using the same function
                
                return res.status(200).json({ message: 'Login Successfully', token: token });
              }else{
                return res.status(401).json({error:'Incorrect Password'});
            }
        })
       
    }else{
        return res.status(404).json({error:'Email does not exist'});
        
    }




}catch(err){
  return  res.status(500).json({
        error:err
    })
}
}