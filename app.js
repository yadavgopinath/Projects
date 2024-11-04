require('dotenv').config();
const express = require('express');
const path = require('path');
const fs= require('fs');
const cors = require ('cors');
const bodyParser = require('body-parser');
const app=express();
const sequelize = require('./util/database');

const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');



app.use(cors());
app.use(bodyParser.json({extended:false}));
app.use(express.urlencoded({ extended: true }));


const userroutes=require('./routes/users');
const expensesroutes = require('./routes/expenses');
const Users = require('./models/users');
const expenses = require('./models/expenses');
const order = require('./models/order');
const download=require('./models/download');
const { FORCE } = require('sequelize/lib/index-hints');
const purchaseroutes = require('./routes/purchase');
const premiumfeaturesroutes =require('./routes/premiumFeature');
const forgotpasswordroute = require('./routes/forgotpassword');
const ForgotPasswordRequests = require('./models/ForgotPassword');
app.use(express.static(path.join(__dirname, 'public')));
const accessLogStream = fs.createWriteStream(
  path.join(__dirname,'access.log'),
  {flag:'a'}
);


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        formAction: ["'self'", "http://54.221.110.84:3000"], // Allow both HTTP and HTTPS
      },
    },
  })
);
// Add the Cross-Origin-Opener-Policy (COOP) header middleware
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  next();
});

// Optional: Add Content-Security-Policy header for form action as fallback
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "form-action 'self' http://54.221.110.84:3000");
  next();
});


app.use(compression());
app.use(morgan('combined',{stream:accessLogStream}));

app.use('/user',userroutes);
app.use('/expenses',expensesroutes);
app.use('/purchase',purchaseroutes);
app.use('/premium',premiumfeaturesroutes);
app.use('/password',forgotpasswordroute);
app.use((req,res)=>{
  console.log(req.url);
  res.sendFile(path.join(__dirname,`public/${req.url}`))
})


Users.hasMany(expenses);
expenses.belongsTo(Users);
Users.hasMany(order);
order.belongsTo(Users);
Users.hasMany(ForgotPasswordRequests, { onDelete: 'CASCADE' }); 
ForgotPasswordRequests.belongsTo(Users); 
Users.hasMany(download);
download.belongsTo(Users);

sequelize.sync()
  .then((result) => {
  
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server running on port 3000'+process.env.PORT);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

