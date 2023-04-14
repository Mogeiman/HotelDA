const { app, BrowserWindow,ipcMain  } = require('electron');
const {sequelize} = require('./models')
const userController = require('./controllers/usercontroller');
const roomController = require('./controllers/roomcontrollers') 
const bookingController = require('./controllers/bookingcontroller')
const logsController = require('./controllers/logcontrollers')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: false,
        nodeIntegration : true
      },
      
  });
  win.loadFile('./src/html/index.html');
  
}



// Synchronize the database schema and send the db instance to the renderer process
sequelize.sync().then(() => {
console.log('connection established')



});


app.whenReady().then(() => {
  createWindow();
  logsController.allLogs()
  userController.logIn()
  userController.signUp()
  roomController.createRoom()
  roomController.allRooms()
  roomController.editRooms()
  roomController.deleteRooms()
  bookingController.addCustomer()
  bookingController.allBooking()
  bookingController.historyBooking()
  bookingController.payBooking()
  bookingController.editBooking()
  bookingController.checkOut()
  bookingController.deleteBooking()
  // bookingController.reinstateClient()
  bookingController.updateBookingScheduled()
  bookingController.updateBookingsOnReady()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

});



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});