const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const check = require("express-validator");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


const saltRounds = 10;
app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

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

function sendActive(mailId,token) {
  console.log("Activation Processing",token);
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
    text: "To verify your account",
    html : '<html><head><body><p>To verify your account</p><a href="http://localhost:5500/token.html?token='+token+'">Click Here</a></body></head></html>',
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
      // alert("Email Already Registered!");
      res.send("Email Already Registered")
    }
    else{
      var token=jwt.sign({email:data.email + parseInt(Math.random()*10)}, "Yc@12Yc", { expiresIn: '1800s' });
      
      console.log("token-------------->",token);
      bcrypt.genSalt(saltRounds, (err, salt) => {
        console.log("----------->");
        bcrypt.hash(data.pwd, salt, function (err, hash) {
          let sql = "insert into user(email,passwrd,token) values(?,?,?)";
          connection.query(sql, [data.email, hash,token], (err, result) => {
            if (err) {
              console.log("Error");
            }
            sendActive(data.email,token);
            console.log("Succesfully Registered...");
            res.json({ result });
          });
        });
      });
    }

  })


});

app.get("/token",(req,res)=>{
  let token = req.query.token
  console.log("query----------->",req.query);
  let sql = "select id from user where token =" + "'" + token + "'";
  connection.query(sql,(err,result)=>{
    console.log("result------------>",result[0].id);
    if(err){
      console.error(err.stack);
    }
    else{
      console.log("Token Matched----------->");
      let sql1 = "update user set token = null,is_verified = 1 where id="+ "'" + result[0].id + "'";
      connection.query(sql1,(err,result)=>{
        if(err){
          console.error(err.stack);
        }
        res.send(""+result)
          })
  }
})

  
  

  // res.send(token)

})




app.post("/logIn", (req, res) => {
  // var pwdCheck;
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


let PORT = process.env.PORT || 3012;

app.listen(PORT, () => {
  console.log("App Running");
});

