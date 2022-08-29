var express = require("express");
var mysql = require("mysql");
var cors = require("cors");
var app = express();

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
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

app.get("/sql", (req, res) => {
  let sql = "select * from user_message";

  connection.query(sql, (err, result) => {
    if (err) {
      res.send("Error");
    }
    res.json({ result });
  });
});

app.post("/sql", (req, res) => {
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



app.put("/putData",(req,res)=>{
  let data = req.body
  console.log("Request",data.id);
  console.log("!!!!!!Request");
  let sql = "update user_message set name=?,email=?,message=? where id = "+data.id;

  connection.query(sql,[data.name,data.mail,data.msg],(err, result) => {
    if (err) {
      console.log(err)
      res.send("Error");
    }
    res.json({ result });
  });
})


app.get("/getRecordById",(req,res)=>{
  console.log("----------->",req.query.id);


  let sql = "select * from user_message where id = "+req.query.id;

  connection.query(sql, (err, result) => {
    if (err) {
      res.send("Error");
    }
    res.json({ result });
  });

})




app.listen(3003, () => {
  console.log("App Running");
});
