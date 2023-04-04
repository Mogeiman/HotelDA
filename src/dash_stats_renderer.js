const {ipcRenderer} = require('electron')

const rooms = document.getElementById('totalRooms');
const available = document.getElementById('availableRooms');
const booked = document.getElementById('bookedRooms');
const sales = document.getElementById('sales');


function loadStats(Bookings, Rooms) {
  let countRooms = 0;
  let countAvailable = 0;
  let countBooked = 0;
  let countSales = 0;
  


  Rooms?.forEach(room => {
    countRooms++;
    rooms.innerText = countRooms;

    
    if (room.dataValues.room_status == true) {
      countAvailable++;
      available.innerText = countAvailable;

    } else {
      countBooked++;
      booked.innerText = countBooked;
    }
  });
  Bookings?.forEach(booking => {
    countSales += booking.dataValues.payed;
    sales.innerText = countSales;

  });

}

const tbody = document.getElementById('tbody')
function renderCustomers(Bookings){
    tbody.innerHTML = ''
    if(Bookings && Bookings.length > 0){
        for(let i = 0; i < 10 && i < Bookings.length; i++){
            const booking = Bookings[i];
            const tr = document.createElement('tr')
            // formating the date
            const createdAt = booking.dataValues.createdAt;
            const date = new Date(createdAt);
            
            const day = date.toLocaleString('en-us', {weekday: 'short'});
            const monthDay = date.toLocaleString('en-us', {month: 'short', day: 'numeric'});
            const year = date.getFullYear();
            
            const formattedDate = `${day}, ${monthDay} ${year}`;
  
  
            // total days
            const startDate = new Date(booking.dataValues.createdAt);
            const endDate = new Date(booking.dataValues.checkout);
  
            const diffInMs = endDate - startDate;
            const totalDays = Math.floor(diffInMs / 86400000);
  
            tr.innerHTML =  `

                        <td>${booking.dataValues.fullname}</td>
                        <td>${booking.dataValues.room_no}</td> 
                        <td>${booking.dataValues.phonenumber}</td> 
                        <td>${formattedDate}</td> 
                        <td>${booking.dataValues.total_cost}</td> 
                        <td>${booking.dataValues.payed}</td> 
                        <td>${booking.dataValues.owed}</td> 
             `
       
            tbody.appendChild(tr)
  
       
        }
    }
  }

      
document.addEventListener('DOMContentLoaded', () => {
    const historyCustomerName =  "default";
    const paymentStatus = "default";
    const bookingStatus = "default";
    const fromDate = "default";
    const toDate = "default";
    const initialData = {
      historyCustomerName,
      paymentStatus,
      bookingStatus,
      fromDate,
      toDate,
    };  ipcRenderer.send('history-booking', initialData);
  ipcRenderer.send('all-rooms');
  
  ipcRenderer.on('history-booking-res', async(event, res) => {  
      const { Bookings } = res;
      loadStats(Bookings, null);
      renderCustomers(Bookings)
  });
  
  ipcRenderer.on('rooms-res', async(event, res) => {
      const { Rooms } = res;
      loadStats(null, Rooms);
  });
});
