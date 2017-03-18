function Transaction(data) {
  data = data || {}
  this.transaction_date = data.transaction_date
  this.value_date = data.value_date
  this.description = data.description
  this.amount = data.amount
  this.new_balance = data.new_balance

  return this
}

Transaction.prototype.serialise = function() {
  return {
    transaction_date : this.transaction_date,
    value_date : this.value_date,
    description : this.description,
    amount : this.amount,
    new_balance : this.new_balance   
  }
}

module.exports = Transaction