const Sib = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');
const Users = require('../models/users');
const forgotpassword = require('../models/ForgotPassword');
const { v4: uuidv4 } = require('uuid'); // Make sure to import uuidv4
const sequalize = require('../util/database');




exports.forgotpassword = async(req, res, next) => {
    const { email } = req.body;

    // Check if email exists in the request body
    if (!email) {
        return res.status(404).json({ message: "email not provided" });
    }
    try{

    const user=await Users.findOne({where:{email:email}});

    if(!user)
    {
        return res.status(404).json({ message: "User Not Exist Kindly Sign-up For New User" });
    }

    const userId = user.id; 
    const requestId = uuidv4(); 
    
    await forgotpassword.create({
        id: requestId,
        userId: userId,
        isActive: true, 
    });



   
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.API_KEY;  
    const transEmailApi = new Sib.TransactionalEmailsApi();
   

        

    // Correct the sender email address
    const sender = {
        email: 'yadavgopinath93@gmail.com',  // Fixed duplicate @gmail.com
        name:'Gopinath  '
    };

    // Receiver email (you can use the one from req.body or any other)
    const receivers = [
        {
            email: email,  // Dummy receiver for now
        }
    ];

    // Send transactional email
   await transEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject: 'Building Expense App',
        textContent: `Almost the app is completed`,
         htmlContent : `
        <html>
            <body>
                    <h1>Password Reset Request</h1>
                    <p>Hi,</p>
                    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
                    <p>Otherwise, click the button below to reset your password:</p>
                    <a href="http://54.221.110.84:3000/password/resetpassword/${requestId}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                        Reset Password
                    </a>
                    <p>If you can't click the button, copy and paste the following URL into your browser:</p>
                    <p>http://54.221.110.84:3000/password/resetpassword/${requestId}</p>
                </body>
        </html>
    `,
    });
        return res.status(200).json({ message: 'Email sent successfully', email: req.body.email });
} catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
}


};

exports.checkresetpassword =async (req,res,next)=>{
   const uid=req.params.uuid;
   
    const uuid= await forgotpassword.findByPk(uid,{
        attributes:[
            'id','isActive'
        ]
    });
    
    // Check if the UUID exists and is active
    if (!uuid || !uuid.isActive) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    // Render your password reset form
    res.send(`
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            width: 300px;
            text-align: center; /* Center the text inside the container */
        }
        h2 {
            margin-bottom: 15px;
        }
        input[type="password"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px; /* Add some space below the input */
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box; /* Ensure padding is included in total width */
        }
        button {
            width: 100%;
            padding: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s; /* Smooth transition for hover */
        }
        button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Password</h2>
        <form action="/password/resetpassword/${uid}" method="POST">
            <input type="password" name="newPassword" placeholder="New Password" required />
            <button type="submit">Reset Password</button>
        </form>
    </div>
</body>
</html>

    `);
}

exports.finalresetpassword= async (req,res,next)=>{
    const t = await sequalize.transaction();
    const { uuid } = req.params; 
    const { newPassword } = req.body; 

    

    if (!newPassword) {
        return res.status(400).json({ message: 'Password is required' });
    }
 
    

    try {
       
        const resetRequest = await forgotpassword.findOne({ where: { id: uuid, isActive: true } },{transaction: t });

        if (!resetRequest) {
            return res.status(400).json({ message: "Invalid or expired reset link" });
        }

      
         // Hash the new password using bcrypt
         const saltRounds = 10;  // Set the number of salt rounds for bcrypt
         const hashedPassword = await bcrypt.hash(newPassword, saltRounds);  // Hash the password
 
         // Update the user's password in the Users table
         await Users.update(
             { password: hashedPassword },
             { where: { id: resetRequest.userId } },{transaction: t}
         );
       
        await forgotpassword.update(
            { isActive: false },
            { where: { id: uuid } },{transaction:t}
        );

        await t.commit();
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: "Error occurred while resetting password", error: error.message });
    }
};