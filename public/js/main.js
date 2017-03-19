(function() {

  var currentCard,
      cardTransactions

  get("/products", function(data) {
    
    // Add spinning loader for the icon
    var card = data.filter(function(product) {
      return product.type === "card"
    })

    if(card && card instanceof Array && card.length > 0) {
      card = card[0]
      currentCard = card
      renderCardPage(card)
    }

  })


  function updateCard(card, transactions) {

    put("/cards/" + card.contract_number, transactions, function(data) {
      console.log(data)
    })
  }

  function renderCardPage(card) {
    var icon = "fa-credit-card-alt"
    card.icon = icon
    
    var header = document.getElementById("main-space")
    render(header, card)

    get("/cards/" + card.contract_number, function(transactions){
      var transactionsContainer = document.getElementById("transactions-list")

      transactions.map(function(transaction) {
        if(transaction.description.indexOf("(PROMISED)") >= 0){
          transaction.status = "promised"
          transaction.description = transaction.description.replace("(PROMISED)", "")
        }
        return transaction
      })

      renderTransactions(transactionsContainer, transactions)

      transactionsContainer.addEventListener("click", function(e) {
        e.preventDefault()

        var li = findParentElementByTagName("li", e.target)
        if(li) {
          togglePages()
          updateCard(card, transactions)
        }
      })
    })
  }


  var backButton = document.getElementById("back-button")
  backButton.addEventListener("click", function(e) {
    e.preventDefault
    togglePages()
  })


  function togglePages() {
    var pagesContainer = document.querySelector(".pages")
    pagesContainer.classList.toggle("switch")
  }
  function renderTransactions(container, transactions) {
    render(container, {
      transactions: transactions
    })
  }

  function get(path, cb) {

    var request = new XMLHttpRequest()
    request.open("GET", path)
    request.setRequestHeader("Accept", "application/json")
    request.addEventListener("load", function(event) {
      var status = this.status
      try {
        var response = JSON.parse(this.response)
      } catch(e) {
        response = this.response
      }

      if(!cb || !(cb instanceof Function)) 
        return
      if(cb && cb instanceof Function)
        cb(response, status)
    })
    request.send()
  }

  function put(path, data, cb) {

    var request = new XMLHttpRequest()
    request.open("PUT", path)
    request.setRequestHeader("Accept", "application/json")
    request.addEventListener("load", function(event) {
      var status = this.status
      try {
        var response = JSON.parse(this.response)
      } catch(e) {
        response = this.response
      }

      if(!cb || !(cb instanceof Function)) 
        return
      if(cb && cb instanceof Function)
        cb(response, status)
    })
    request.send(JSON.stringify(data))
  }

  function findParentElementByTagName(tagName, element) {
    tagName = tagName.toLowerCase()
    while (element !== null && element.tagName) {
      if(element.tagName.toLowerCase() === tagName){
        return element
      }
      element = element.parentNode
    }

    return false
  }

})()