const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const check = require("express-validator");
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
    console.log("error connecting" + err.stack);
    return;
  }
  console.log("connected as id :", +connection.threadId);
});





app.post("/signUp", (req, res) => {
  let data = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    console.log("----------->");
    bcrypt.hash(data.pwd, salt, function (err, hash) {
      let sql = "insert into user(email,passwrd) values(?,?)";
      connection.query(sql, [data.email, hash], (err, result) => {
        if (err) {
          console.log("Error");
        }
        res.json({ result });
      });
    });
  });
});



app.post("/logIn",(req,res)=>{
    let data = req.body;
    bcrypt.compare(data.pwd, hash, function(err, result) {
        if (result) {
           window.location = "form_operations.html"
       }
    });
})


app.listen(3010, () => {
  console.log("App Running");
});
