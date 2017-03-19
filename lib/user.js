var request = require("request")
var config = require("../config")
var Product = require("./product")
var Transaction = require("./transaction")

function User(options) {
  this.token = {}
  this.id = options.identifier
  this.mobile_numbers = options.mobile_numbers
  this.email_addresses = options.email_addresses
  this.first_name = options.first_name
  this.last_name = options.last_name
  this.username = options.username
  this.password = options.password

  this.products = []

  return this
}

User.prototype.serialise = function() {
  return {
    "id": this.id,
    "messages_count": 0,
    "authentication": {
      "username": this.username,
      "password": this.password
    },
    "info": {
      "first_name": this.first_name,
      "last_name": this.last_name,
      "email_addresses": this.email_addresses,
      "mobile_numbers": this.mobile_numbers
    },
    "products": this.products
  }
}

User.prototype.authorise = function(username, password, callback) {
  // TODO: Add a method, and accept refreshTokens together with password tokens

  var that = this
  var authData = Object.assign(config.credentials, {})
  authData.grant_type = "password"
  authData.username = username,
  authData.password = password

  request({
      url: 'http://api.beyondhackathon.com/authorization/token',
      method: 'POST',
      qs: authData,
      headers: {
        'Accept': 'application/json'
      }
  }, function(err, response, body) {

    var data
    try {
      data = JSON.parse(body)
    } catch(e) {
    }

    if(data) {
      that.token = {
        value: data.access_token,
        type: data.token_type,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        time_issued: Date.now(),
        scope: data.scope,
        jti: data.jti
      }
    }

    callback(err, data)
  })
}
User.prototype.getProducts = function(callback) {
  request({
    url: "http://api.beyondhackathon.com/customers/me/products",
    method: "GET",
    headers: {
      "Authorization": "Bearer " + this.token.value,
      "Accept": "application/json"
    }
  }, callback)
}

User.prototype.getCardDetails = function(contractNumber, callback) {
  request({
    url: `http://api.beyondhackathon.com/cards/${contractNumber}/statement`,
    method: "GET",
    headers: {
      "Authorization": "Bearer " + this.token.value,
      "Accept": "application/json"
    }
  }, callback)
}

User.prototype.getInfo = function(callback) {
  request({
    url: `http://api.beyondhackathon.com/customers/me/info`,
    method: "GET",
    headers: {
      "Authorization": "Bearer " + this.token.value,
      "Accept": "application/json"
    }
  }, callback)
}

var authoriseRetries = 0
User.prototype.exists = function(cb) {
  var that = this
  if(authoriseRetries > 5) return cb(false)
  if(!that.token.value) {
    that.authorise(that.username, that.password, function(err, data) {
      authoriseRetries++
      if(data.error && data.error === "invalid_grant") return cb(false)
      that.exists(cb)
    })
  } 
  else {
    that.getInfo(function(err, response, data) {
      if(data) return cb(true)
    })
  }
}

User.prototype.addProduct = function(product) {
  this.products.push(product)
}

User.prototype.addDefaultProducts = function() {
  var that = this
  this.addProduct(new Product({
    "type": "account",
    "contract_number": "00260329340114280233",
    "balance": 0,
    "available_balance": 0,
    "currency": "EUR",
    "alias": "salary",
    "transactions": []
  }))

  this.addProduct(new Product({
    "type": "card",
    "contract_number": "4057849369252814",
    "balance": 0,
    "available_balance": 0,
    "currency": "EUR",
    "alias": "creditCard",
    "transactions": that.getDefaultTransactions()
  }))

  this.addProduct(new Product({
    "type": "account",
    "contract_number": "13075657",
    "balance": 0,
    "available_balance": 0,
    "currency": "EUR",
    "alias": "promising_account",
    "transactions": [
      
    ]
  }))


  var cardProduct = that.products.filter(function(obj) {
    return obj.contract_number === "4057849369252814"
  })[0]

  // this balance should also show the "promised payments"
  cardProduct.balance = cardProduct.transactions[0].new_balance
  // this should be what you owe in general
  cardProduct.available_balance = cardProduct.transactions[0].new_balance
}


User.prototype.clearProducts = function() {
  this.products = []
}
User.prototype.getDefaultTransactions = function() {
  return [

    new Transaction({
      transaction_date: "2016-06-06",
      value_date: "2016-06-06",
      description: "(PROMISED) Αγορά Ergonomic heuristic flexibility",
      amount: -58,
      new_balance: -457.47,
      mcc: "3040"
    }),
    new Transaction({
      transaction_date: "2016-06-06",
      value_date: "2016-06-06",
      description: "Αγορά Configurable 6thgeneration customer loyalty",
      amount: -108.47,
      new_balance: -399.47,
      mcc: "3029"
    }),
    new Transaction({
      transaction_date: "2016-06-02",
      value_date: "2016-06-02",
      description: "(PROMISED) Αγορά Object-based real-time frame",
      amount: -125.15,
      new_balance: -290.79,
      mcc: "3228"
    }),
    new Transaction({
      transaction_date: "2016-06-01",
      value_date: "2016-06-01",
      description: "Αγορά Public-key full-range neural-net",
      amount: -100.30,
      new_balance: -165.64,
      mcc: "3102"
    }),
    new Transaction({
      transaction_date: "2016-06-01",
      value_date: "2016-06-01",
      description: "Αγορά Public-key full-range neural-net",
      amount: -65.34,
      new_balance: -65.34,
      mcc: "3102"
    })
  ]
}

var defaultTransaction = function() {
  return {
    "transaction_date": "2017-3-18",
    "value_date": "2017-3-18",
    "description": "Transfer regarding cardTransaction: 12345",
    "amount": 0,
    "new_balance": 0
  }
}

User.prototype.save = function(callback) {
  var data = this.serialise()
  request({
      url: 'http://api.beyondhackathon.com/backend/save',
      method: 'POST',
      qs: data,
      headers: {
        'Accept': 'application/json',
        "Content-type": "application/json"
      },
      body: JSON.stringify(data)
  }, callback)
}

User.prototype.loadInfo = function(cb) {

  var that = this
  if(that.fetchedInfo) return cb()
  that.fetchedInfo = true

  that.getInfo(function(err, response, data){
    try {
      data = JSON.parse(data)
    }
    catch (e){
    }

    that.mobile_numbers = data.mobile_numbers
    that.email_addresses = data.email_addresses
    that.first_name = data.first_name
    that.last_name = data.last_name

    that.getProducts(function(err, response, data) {
      try {
        data = JSON.parse(data)
      }
      catch (e){
      }
      that.products = data
      
      // TODO: Get every product's transactions
      var card = that.products.filter(function(product) {
        return product.type === "card"
      })

      if(card && card.length > 0) {
        card = card[0]
        that.getCardDetails(card.contract_number, function(err, response, transactions) {
          try {
            transactions = JSON.parse(transactions)
          }
          catch (e){
          }

          card.transactions = transactions

          if(cb && cb instanceof Function)
            cb(that.serialise())
        })
      }

      if(cb && cb instanceof Function)
        cb(false)

    })
  })
}

User.prototype.getCard = function(contract_number) {
  var card = this.products.filter(function(product) {
    return product.type === "card" && product.contract_number === contract_number
  })

  if(card && card.length > 0) 
    return card[0]

  return false
}

module.exports = User