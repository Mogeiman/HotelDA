const { ipcRenderer } = require('electron');

const loginForm = document.querySelector('#login-form');
const mes = document.querySelector('#mes');

function loginUser(e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const username = formData.get('email');
  const password = formData.get('password');
  ipcRenderer.send('logIn-User', { username, password });
}


ipcRenderer.on('login-res', (event, res) => {
  console.log(res?.state, res.message)
  if (res.state == false) {
    mes.innerHTML = res.message;
  } else {
    window.location.href = './pages/dashboard.html';
  }
});

loginForm.addEventListener('submit', loginUser);

