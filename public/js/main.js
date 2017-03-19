(function() {

  ajax("/products", function(data) {
    
    // Add spinning loader for the icon
    var card = data.filter(function(product) {
      return product.type === "card"
    })

    if(card && card instanceof Array && card.length > 0) {
      card = card[0]
      renderCardPage(card)
    }

  })

  function renderCardPage(card) {
    var icon = "fa-credit-card-alt"
    card.icon = icon
    
    var header = document.getElementById("main-space")
    render(header, card)

    ajax("/cards/" + card.contract_number, function(data){
      var transactionsContainer = document.getElementById("transactions-list")

      data.map(function(transaction) {
        if(transaction.description.indexOf("(PROMISED)") >= 0){
          transaction.status = "promised"
          transaction.description = transaction.description.replace("(PROMISED)", "")
        }
        return transaction
      })
      renderTransactions(transactionsContainer, data)

      transactionsContainer.addEventListener("click", function(e) {
        e.preventDefault()

        var li = findParentElementByTagName("li", e.target)
        if(li) {
          togglePages()
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

  function ajax(path, cb) {

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