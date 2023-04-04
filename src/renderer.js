const { ipcRenderer } = require('electron');

const signupForm = document.querySelector('#signup-form');

const mes = document.querySelector('#mes');

function signupUser(e){
    e.preventDefault();
    const formData = new FormData(signupForm);
    const username = formData.get('email');
    const password = formData.get('password');
    ipcRenderer.send('create-user', { username, password });}
  
  
  ipcRenderer.on('signup-res', (event, res) =>{
    if(res.state == false){
      mes.innerHTML = res.message
    } else {
      window.location.href = './index.html';
  
    }
  })





signupForm.addEventListener('submit', signupUser);
