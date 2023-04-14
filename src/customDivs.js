const successDiv = document.createElement('div')
const successTextDiv = document.createElement('span')
successDiv.classList.add('alert', 'alert-success', 'success-div');
successDiv.id = ('success-div')
successDiv.style.width = '300px'
successDiv.style.height = '10px'
successDiv.style.position = 'absolute'
successDiv.style.top = '10px'
successDiv.style.left = '50%'
successDiv.style.display = 'none'
successDiv.style.justifyContent = 'center'
successDiv.style.alignItems = 'center'
successDiv.appendChild(successTextDiv)
document.body.appendChild(successDiv);

const errorDiv = document.createElement('div')
const errorTextDiv = document.createElement('span')
errorDiv.classList.add('alert', 'alert-danger');
errorDiv.id = ('error-div')
errorDiv.style.width = '250px'
errorDiv.style.height = '10px'
errorDiv.style.position = 'absolute'
errorDiv.style.top = '10px'
errorDiv.style.left = '50%'
errorDiv.style.display = 'none'
errorDiv.style.justifyContent = 'center'
errorDiv.style.alignItems = 'center'
errorDiv.appendChild(errorTextDiv)
document.body.appendChild(errorDiv);


function displayError(){
    errorDiv.style.display = 'flex'
    setTimeout(function() {
      $('#error-div').fadeOut('slow');
  }, 2000);    
}

function displaySuccess(){
    successDiv.style.display = 'flex'
    setTimeout(function() {
      $('#success-div').fadeOut('slow');
  }, 2000);    
}