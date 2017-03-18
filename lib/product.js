function Product(data) {
  data = data || {}
  this.type = data.type,
  this.contract_number = data.contract_number,
  this.balance = data.balance,
  this.available_balance = data.available_balance,
  this.currency = data.currency,
  this.alias = data.alias,
  this.transactions = data.transactions

  return this
}

module.exports = Product