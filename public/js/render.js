var render = function(container, data) {

  var valueElements = container.querySelectorAll("[data-value-key]")

  // Render element values
  for (var i = valueElements.length - 1; i >= 0; i--) {
    var element = valueElements[i],
        valueKey = element.dataset.valueKey,
        value

    try {
      value = eval("data." + valueKey)
    } catch(e) {
      value = ""
    }

    if(value === undefined) value = ""
    element.innerHTML = value
  }

  var classNames = container.querySelectorAll("[data-class-name]")

  if(container.dataset.className){
    classNames = Array.prototype.slice.call(classNames)
    classNames.push(container)
  }

  // Render element values
  for (var i = classNames.length - 1; i >= 0; i--) {
    var element = classNames[i],
        valueKey = element.dataset.className,
        value

    try {
      value = eval("data." + valueKey)
    } catch(e) {
      value = ""
    }

    if(value)
      element.classList.add(value)

    // stupid hack but will work for the demo :P
    if(!value && element.className.indexOf("transaction") >= 0) 
      element.classList.remove("promised")
  }

  var idElements = container.querySelectorAll("[data-id]")

  if(container.dataset.id){
    idElements = Array.prototype.slice.call(idElements)
    idElements.push(container)
  }

  // Render element values
  for (var i = idElements.length - 1; i >= 0; i--) {
    var element = idElements[i],
        valueKey = element.dataset.id,
        value

    try {
      value = eval("data." + valueKey)
    } catch(e) {
      value = ""
    }

    if(value)
      element.dataset.identifier = value
  }

  var arrayElements = container.querySelectorAll("[data-each]")
  for (var i = arrayElements.length - 1; i >= 0; i--) {
    var element = arrayElements[i],
        valueKey = element.dataset.each,
        dataset

    try {
      dataset = eval("data." + valueKey)
    } catch(e) {
      dataset = {}
    }

    for (var k = 0; k < dataset.length; k++) {
      templateElement = element.parentNode.querySelector("[data-each-pass-id='" + k + "']") || element.cloneNode(true)

      templateElement.dataset.eachPassId = k

      delete templateElement.dataset.each
      if(!templateElement.parentNode)
        element.parentNode.appendChild(templateElement)

      render(templateElement, dataset[k])
    }
    element.style.display = "none"

  }
}