var express = require("express")
var path = require("path")
var bodyParser = require("body-parser")
var request = require("request")
var User = require("./lib/user")
var Product = require("./lib/product")
var Transaction = require("./lib/transaction")
var http = require("http")
var app = express()



var user = new User(defaultUser())

user.exists(function(exists) {
  if(!exists) {
    user.addDefaultProducts()
    user.save(function(err, response, data) {
      console.log("after save?", data)
    })
  }
  else {
    console.log("user exists, no need to save him again!")
  }
})

user.loadInfo()

function defaultUser() {
  return {
    identifier: "14953278",
    mobile_numbers: ["6976797579"],
    email_addresses: ["john@doe.com"],
    first_name: "John",
    last_name: "Doe",
    username: "finfreak4",
    password: "password",
  }
}

app.get("/clear", function(req, res) {
  user.clearProducts()
  user.addDefaultProducts()
  user.save(function(err, response, data){
    console.log("after saving", data)
  })
})

app.get('/', function (req, res) {
  user.authorise("msimmons", "ckmkxujmltr", function(err, body){
    if(err) {
      res.send(error)
    } else {
      res.send(user)
    }
  })
})

app.get("/authorise", function(req, res) {

  user.authorise("msimmons", "ckmkxujmltr", function(err, body){
    if(err) {
      res.send(error)
      return
    }

    res.send(user)
  })
})


app.get("/products", function(req, res) {
  user.getProducts(function(err, response, data) {
    handleResponse(res, err, data)
  })
})

app.get("/cards/:contractNumber", function(req, res) {
  user.getCardDetails(req.params.contractNumber, function(err, response, data) {
    handleResponse(res, err, data)
  })
})

app.put("/cards/:contractNumber", bodyParser.json(), function(req, res){

  // since we are doing in-memory searches this doesn't need to be asynchronous
  var card = user.getCard(req.params.contractNumber)
  console.log("card to replace", card)
  console.log("OMGOMGOMG", req.body)
  res.end("OMGOMGOMOMGOMGOMGO")
})


app.use(express.static(path.join(__dirname, "public")))

var handleResponse = function(res, err, data) {
  if(err) return res.send({err}) 
  try {
    data = JSON.parse(data) 
  } catch(e) {}

  if(data.error && data.error === "invalid_token") return res.redirect("/")
    res.send(data)
}



app.use(function(req, res, next) {
  res.writeHead(404)
  res.end("Resource not found")
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})