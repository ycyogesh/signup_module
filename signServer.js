const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const check = require("express-validator");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');


const saltRounds = 10;
app = express();
app.use(cors());
app.use(express.json());

var connection = mysql.createConnection({
  host: "localhost",
  user: "nodejs",
  password: "Node@123",
  database: "crud",
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting" + err.stack);
    return;
  }
  console.log("connected as id :", +connection.threadId);
});

function sendActive(mailId) {
  console.log("Activation Processing");
  var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "594b747d5faf6b",
      pass: "156e561cccbc78"
    }
  });

  var mailOptions = {
    from: "yc@yc.com",
    to: mailId,
    subject: "Verify Your Account",
    text: "That was easy!",
    dsn: {
      id: 'ID',
      return: 'headers',
      notify: 'success',
      notify: ['failure', 'delay'],
      recipient: ''
  }
  };

  transporter.sendMail(mailOptions, function (error, info) {
    console.log("<-------Entered------>");
    console.log("----------->",error);
    console.log("---------------->",info);
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

app.post("/signUp", (req, res) => {
  let data = req.body;


  
  let sqlCheck = "select email from user where email =" + "'" + data.email + "'";
  connection.query(sqlCheck,(err,result)=>{
    if(err){
      console.error(err.stack);
    }
    else if(result.length>0){
      console.log("Email Already Registered");
      res.send("Email Already Registered")
    }
    else{
      var token=jwt.sign({email:data.email}, "Yc@12Yc", { expiresIn: '1800s' });
      
      console.log("token-------------->",token);
      bcrypt.genSalt(saltRounds, (err, salt) => {
        console.log("----------->");
        bcrypt.hash(data.pwd, salt, function (err, hash) {
          let sql = "insert into user(email,passwrd,token) values(?,?,?)";
          connection.query(sql, [data.email, hash,token], (err, result) => {
            if (err) {
              console.log("Error");
            }
            sendActive(data.email);
            console.log("Succesfully Registered...");
            res.json({ result });
          });
        });
      });
    }

  })


});

app.post("/logIn", (req, res) => {
  var pwdCheck;
  let data = req.body;
  console.log(data);
  console.log("Password Entered", data.pwd);

  

  let sql = "select passwrd from user where email=" + "'" + data.email + "'";
  connection.query(sql, (err, result) => {
    if (err) {
      console.error(err.stack);
    }

    console.log("Password in Database", result[0].passwrd);
    bcrypt.compare(data.pwd, result[0].passwrd, (err, result) => {
      if (result) {
        console.log("Matched");
      } else {
        console.log("Not Matched");
      }
    });
  });
});

app.listen(3011, () => {
  console.log("App Running");
});

