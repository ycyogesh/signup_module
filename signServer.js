const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const check = require("express-validator");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
require("dotenv").config();
var { expressjwt: jwtverify } = require("express-jwt");
const rateLimit = require("express-rate-limit");
const MaskData = require("maskdata");
const { body } = require("express-validator");

const saltRounds = 10;
var count;
app = express();
app.use(cors());
app.use(express.json());
// dotenv.config();
app.use(
  jwtverify({
    secret: "yc@201",
    algorithms: ["HS256"],
  }).unless({ path: ["/token", "/logIn", "/signUp", "/forPass", "/chgPass"] })
);

// LIMITER

const checktLimiter = rateLimit({
  windowMs: 1440 * 60 * 1000, // 24 hour
  max: 5, // Limit each IP to 5 create account requests per `window` (here, per hour)
  message: "Something went wrong", // Try Again Tomorrow
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use("/api", checktLimiter);

// MASKING DATA

const maskOptions = {
  maskWith: "*",
  // maxMaskedCharacters: 20, // To limit the output String length to 20.
  // unmaskedStartCharacters: 4,
  // unmaskedEndCharacters: 9 // As last 9 characters of the secret key is a meta info which can be printed for debugging or other purpose
};

// var nodeUser = MaskData.maskPassword("594b747d5faf6b",maskOptions)
// var nodePass = MaskData.maskPassword("156e561cccbc78",maskOptions)

// MYSQL CONNECTION

var connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.MYSQL_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting" + err.stack);
    return;
  }
  console.log("connected as id :", +connection.threadId);
});

// SIGNUP ACTIVATION MAIL FUNCTION

function sendActive(mailId, token) {
  return new Promise((resolve, reject) => {
    console.log("Activation Processing", token);
    var transporter = nodemailer.createTransport({
      host: process.env.HOST_EMAIL,
      port: 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    var mailOptions = {
      from: "yc@yc.com",
      to: mailId,
      subject: "Verify Your Account",
      text: "To verify your account",
      html:
        '<html><body><p>To verify your account</p><a href="http://localhost:5500/token.html?token=' +
        token +
        '">Click Here</a></body></html>',
      dsn: {
        id: "ID",
        return: "headers",
        notify: "success",
        notify: ["failure", "delay"],
        recipient: "",
      },
    };

    transporter.sendMail(mailOptions, function (error, info) {
      console.log("<-------Entered------>");
      console.log("----------->", error);
      console.log("---------------->", info);
      if (error) {
        console.log(error);
        reject(false);
      } else {
        console.log("Email sent: " + info.response);
        resolve(true);
      }
    });
  });
}

// FORGOT PASSWORD MAIL FUNCTION

function mailForPass(mailId, token) {
  return new Promise((resolve, reject) => {
    console.log("Activation Processing", token);
    var transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "594b747d5faf6b",
        pass: "156e561cccbc78",
      },
    });

    var mailOptions = {
      from: "yc@yc.com",
      to: mailId,
      subject: "Reset Your Password",
      text: "To verify your account",
      html:
        '<html><body><p>To reset your password</p><a href="http://localhost:5500/password.html?token=' +
        token +
        '">Click Here</a></body></html>',
      dsn: {
        id: "ID",
        return: "headers",
        notify: "success",
        notify: ["failure", "delay"],
        recipient: "",
      },
    };

    transporter.sendMail(mailOptions, function (error, info) {
      console.log("<-------Entered------>");
      console.log("----------->", error);
      console.log("---------------->", info);
      if (error) {
        console.log(error);
        reject(false);
      } else {
        console.log("Email sent: " + info.response);
        resolve(true);
      }
    });
  });
}

// SIGNUP

app.post("/signUp", (req, res) => {
  let data = req.body; // let {email,pwd} = req.body

  let sqlCheck = "select * from user where email =?";
  connection.query(sqlCheck, [data.email], (err, result) => {
    // console.log("index--------------->",result.indexOf("token"));
    if (err) {
      console.error(err.stack);
    } else if (result.length > 0) {
      if (result[0].is_verified == 0) {
        console.log("Please verify your mail!");
        sendActive(data.email, result[0].token);
      } else {
        console.log("Something went wrong!"); //or redirect login page
        res.json("Something went wrong!");
      }
    } else {
      var token = jwt.sign(
        { email: data.email + parseInt(Math.random() * 10) },
        "Yc@12Yc"
      );
      console.log("token-------------->", token);
      bcrypt.genSalt(saltRounds, (err, salt) => {
        console.log("----------->");
        bcrypt.hash(data.pwd, salt, function (err, hash) {
          let sql = "insert into user(email,passwrd,token) values(?,?,?)";
          connection.query(
            sql,
            [data.email, hash, token],
            async (err, result) => {
              if (err) {
                console.log("Error");
              }
              let res = await sendActive(data.email, token);
              if (res) {
                console.log("Succesfully Registered...");
                res.json(true);
              } else {
                console.log("Nothing");
              }
            }
          );
        });
      });
    }
  });
});

// VERIFY TOKEN

app.get("/token", (req, res) => {
  let token = req.query.token;
  console.log("query----------->", req.query);
  let sql = "select * from user where token =?";
  connection.query(sql, [token], (err, result) => {
    console.log("result------------>", result[0].id);
    if (err) {
      console.error(err.stack);
    } else if (result.length > 0) {
      if (result[0].token != null) {
        console.log("Token Matched----------->");
        let sql1 = "update user set token = null,is_verified = 1 where id=?";
        connection.query(sql1, [result[0].id], (err, result) => {
          if (err) {
            console.error(err.stack);
          }
          res.send(true); //true
        });
      } else {
        res.send(false);
      }
    } else {
      res.send(false);
    }
  });
});

// LOGIN

app.post("/logIn", (req, res) => {
  let data = req.body;
  console.log(data);
  console.log("Password Entered", data.pwd);

  let sql = "select * from user where email=?";
  connection.query(sql, [data.email], (err, result) => {
    // Get Data
    // const today  = new Date(); // The Date object returns today's timestamp
    // today.setDate(today.getDate());

    // Get Time
    // const d = new Date();
    // let time = d.getTime();

    // Get Hour
    // const d = new Date();
    // let hour = d.getHours();

    // Yesterday
    // const yesterday = new Date();
    // yesterday.setDate(yesterday.getDate() - 1);

    // Today
    // const today = new Date();
    // today.setDate(today.getDate());

    // console.log("Hour-------------->",yesterday);
    // let count = result[0].loginCount
    console.log("Select Query--------->",result);
    console.log("length --------->",result.length);
    if (result.length > 0) {
    let countCheck = result[0].loginCount;
      if (countCheck == 3) {
        console.log("Entered Countcheck part---------->");
        if (result[0].isBlocked == 0) {
          let sql =
            "update user set blockTime=unix_timestamp(now()), isBlocked=? where id=?";
          connection.query(sql, [1, result[0].id], (err, updateResult) => {
            if (err) {
              console.error("error" + err.stack);
              res.send("Update Error", updateResult);
              return;
            }
            res.json({"Updated" : "Updated"});
            return;
          });
          return;
        }
        let sql = "select unix_timestamp(now()) as time;";
        connection.query(sql, (err, timeQuery) => {
          if (err) {
            console.error("time error", err.stack);
            res.send("Error");
            return;
          }
          let checkTime = timeQuery[0].time - result[0].blockTime;
          console.log("checkingggggggggggg", checkTime);
          if (checkTime > 86400) {
            // loginCount = 0
            let sql = "update user set loginCount=?,isBlocked=?,blockTime=null where id=?";
            connection.query(sql, [0, 0,result[0].id], (err, resetCount) => {
              if (err) {
                console.error("time error", err.stack);
                res.send("Error");
                return;
              }
              res.status("status");
            });
          }
          // console.log("currentTime----------->",timeQuery[0].time);
        });
        res.json("Something went wrong!");
        return;
      }
      //return;
    };
    if (result.length > 0 && result[0].isBlocked == 0) {
      console.log("------------>", result);
      if (err) {
        console.error(err.stack);
        res.send("Error");
      } else if (result[0].is_verified == 1) {
        console.log("Password in Database", result[0].passwrd);
        bcrypt.compare(data.pwd, result[0].passwrd, (err, result1) => {
          if (err) {
            console.error(err.stack);
            res.send("Error");
            return;
          } else if (result1) {
            {
              console.log("Matched");
              let token = jwt.sign(
                { email: data.email + parseInt(Math.random() * 10) },
                "yc@201"
              );

              // const tomorrow = new Date(); // The Date object returns today's timestamp
              // tomorrow.setDate(tomorrow.getDate() + 1);

              res.json({ result: result, token: token });
            }
          } else {
            countCheck = result[0].loginCount
            if(countCheck < 4){
            let sql = "update user set loginCount =? where id=?";
            connection.query(
              sql,
              [countCheck + 1, result[0].id],
              (err, result4) => {
                if (err) {
                  console.error("Update part Error", err.stack);
                  res.send("Error");
                  return;
                }
                console.log("Updated Successfully!", result4);
              }
            );
            console.log("Something went wrong!"); // Password not matched
            res.json({ result: false });
            // res.send("Something went wrong!...")
          }
        }
        });
      } else {
        console.log("Something went wrong!"); // Not verified
        res.json({ result: false });
      }
    } else {
      // send mail with token or verify anything
      console.log("Something went wrong!");
      res.json({ result: false });
    }
  });
});

// FORGOT PASSWORD
// VERIFY MAIL

app.post("/forPass", checktLimiter, (req, res) => {
  let email = req.body.email;
  console.log("mail-------->", email);
  let sql = "select * from user where email =?";
  connection.query(sql, [email], (err, result) => {
    console.log("resultttttttttttttt--->>>>>", result);
    if (err) {
      console.error(err.stack);
      return;
    } else if (result.length == 0) {
      console.log("Something went wrong!");
      return;
    } else if (result[0].email == email && result[0].is_verified == 1) {
      console.log("Mail Matched");
      // var count = result[0].used
      var token = jwt.sign(
        { email: email + parseInt(Math.random() * 10) },
        "yc@20"
      );
      console.log("token new---------------->", token);
      let sql = "update user set token_forPass=? where id=?";
      connection.query(sql, [token, result[0].id], async (err, result1) => {
        if (err) {
          console.error(err.stack);
        }
        resp = await mailForPass(email, token);
        if (resp) {
          console.log("inserted", result1);
          res.json({
            result: true,
            token: token,
          });
        }
        res.json({ result: false });
      });
    } else {
      console.log("Something went wrong!");
    }
  });
});

// SET NEW PASSWORD

app.post("/chgPass", (req, res) => {
  let pass = req.body.pass;
  let token = req.body.token;
  console.log("request body-------->", req.body);
  bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(pass, salt, (err, hash) => {
      console.log("hashhhhhhhhh", hash);
      let sql = "select * from user where token_forPass =?";
      connection.query(sql, [token], (err, result3) => {
        if (err) {
          console.error(err.stack);
        }
        console.log("result---------3>", result3);
        let sql =
          "update user set passwrd=?,token_forPass=null,used=0 where id=?";
        connection.query(sql, [hash, result3[0].id], (err, result2) => {
          if (err) {
            console.error(err.stack);
          }
          console.log("Succesfully updated", result2);
          res.json(true);
        });
      });
    });
  });
});

// VIEW LIST

app.get("/sql", (req, res) => {
  let sql = "select * from user_message";

  connection.query(sql, (err, result) => {
    if (err) {
      res.send("Error");
    }
    res.json({ result });
  });
});

// SUBMIT DATA

app.post("/submitData", (req, res) => {
  let data = req.body;
  console.log(req);
  console.log("sssssssss", req.body);
  let sql = "insert into user_message(name, email, message) values(?,?,?)";
  connection.query(sql, [data.name, data.mail, data.msg], (err, result) => {
    if (err) {
      res.send("Error");
    }
    console.log("!!!!!!!!!!", result);
    res.json({ result });
  });
});

// UPDATE DATA

app.put("/putData", (req, res) => {
  let data = req.body;
  console.log("Request", data.id);
  console.log("!!!!!!Request");
  let sql = "update user_message set name=?,email=?,message=? where id = ?";

  connection.query(
    sql,
    [data.name, data.mail, data.msg, data.id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("Error");
      }
      res.json({ result });
    }
  );
});

// GET RECORD FOR BINDING

app.get("/getRecordById", (req, res) => {
  console.log("----------->", req.query.id);

  let sql = "select * from user_message where id = ?";

  connection.query(sql, [req.query.id], (err, result) => {
    if (err) {
      res.send("Error");
    }
    res.json({ result });
  });
});

// RUNNING SERVER

let PORT = process.env.PORT || 3012;

app.listen(PORT, () => {
  console.log("App Running");
  // console.log("Inputs---->",process.env);
});
