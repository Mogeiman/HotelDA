const { ipcRenderer } = require("electron");
const filterButton = document.querySelector("#filterButton");



filterButton.addEventListener("click", () => {
  $("#filterModal").modal("show");
});
// render rooms
// const select = document.querySelector("#reinstateRoom");

// function renderRooms(Rooms) {
//   select.innerHTML = '<option value="">Select Room</option>';
//   if (Rooms && Rooms.length > 0) {
//     Rooms.forEach((room) => {
//       if (room.dataValues.room_status === 1) {
//         const option = document.createElement("option");
//         option.value = room.dataValues.room_no;
//         option.text = `Room ${room.dataValues.room_no}`;
//         select.appendChild(option);
//       }
//     });
//   } else{
//   errorTextDiv.textContent = 'No rooms at the moment'
//   displayError()
// }
// }
// render history

const tbody = document.getElementById("tbody");
function renderHistory(Bookings){
    tbody.innerHTML = ''
    if(Bookings && Bookings.length > 0){
      Bookings.forEach((booking) => {
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
            <td>
              <div class="dropdown">
                <button class="btn btn-sm btn-secondary dropdown-toggle options-button" type="button" id="optionsButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu" aria-labelledby="optionsButton">
                </div>
              </div>
            </td>
          `;
            
        const dropdownMenu = tr.querySelector('.dropdown-menu');
        if (booking.dataValues.customer_status === 0) {
            dropdownMenu.innerHTML = `
            <a class="dropdown-item pay-owed" href="#" data-id="${booking.dataValues.id}" data-fullname="${booking.dataValues.fullname}" data-owed="${booking.dataValues.owed}"  ${booking.dataValues.owed <= 0 ? 'style="display: none;"' : ''}>Pay Owed</a>
          `;
          
          // const reinstateButton = tr.querySelector('.reinstate-client');
          // reinstateButton.addEventListener('click', () => {
          //   $('#reinstateModal').modal("show");
          //   const checkOut = reinstateButton.dataset.checkout;
          //   const createdAt = reinstateButton.dataset.createdAt;
          //   const id = reinstateButton.dataset.id;

            
            

          //   const checkOutDate = new Date(checkOut);
          //   const formattedCheckout = checkOutDate.toISOString().slice(0, 10);  
          //   $("#reinstateCheckOut").val(formattedCheckout);
          //   $("#reinstateCheckOut").attr("min", formattedCheckout);
          
          
          //   $("#reinstateId").val(id);
          // });
          

          const payBookingButton = tr.querySelector('.pay-owed')
          payBookingButton.addEventListener('click', ()=>{
            $("#payModal").modal("show");

            // Retrieve fullname and id from data attributes
            const fullname = payBookingButton.dataset.fullname;
            const id = payBookingButton.dataset.id;
            const owed = payBookingButton.dataset.owed

            $("#bookingId").val(id); // Assumes you're using jQuery
            $("#customerName").val(fullname); // Assumes you're using jQuery
            const amount = document.querySelector('#owedAmount');
            amount.max = owed;  

          })
        } else {
          dropdownMenu.innerHTML = `
            <a class="dropdown-item disabled" href="#">Booking</a>
          `;
        }
            
        tbody.appendChild(tr)
      })
    } else {
      console.log('no history')
    }
  }
  

document.addEventListener("DOMContentLoaded", () => {
 
  // form information
  const formData = new FormData(historyForm);
  const historyCustomerName = formData.get("historyCustomerName") || "default";
  const paymentStatus = formData.get("paymentStatus") || "default";
  const bookingStatus = formData.get("bookingStatus") || "default";
  const fromDate = formData.get("fromDate") || "default";
  const toDate = formData.get("toDate") || "default";
  const initialData = {
    historyCustomerName,
    paymentStatus,
    bookingStatus,
    fromDate,
    toDate,
  };
      // pay booking
      ipcRenderer.on('pay-booking-res', async(event, res)=>{
        if(res.status == true){
          $("#amount").val('');
          ipcRenderer.send('history-booking',initialData)
          $('#payModal').modal('hide');
          payForm.reset()
          successTextDiv.textContent = res.message
          displaySuccess()
        }else{
          errorTextDiv.textContent = res.message
          displayError()
        }
          })
  // reinstate client
  ipcRenderer.on("reinstate-client-res", async (event, res) => {
    if (res.status == true) {
      ipcRenderer.send("history-booking", initialData);
      $('#reinstateModal').modal('hide'); 
      reinstateForm.reset()
      successTextDiv.textContent = res.message
      displaySuccess()
    }else{
      errorTextDiv.textContent = res.message
      displayError()
    }
  });

  ipcRenderer.send("history-booking", initialData);
  ipcRenderer.on("history-booking-res", async (event, data) => {
    try{
      const { Bookings } = data;
      renderHistory(Bookings);
      $("#filterModal").modal("hide");
    } catch (err) {
      console.log(err);
    }
  });

  // rooms
  // ipcRenderer.send("all-rooms");
  // ipcRenderer.on("rooms-res", (event, data) => {
  //   const { Rooms } = data;
  //   renderRooms(Rooms);
  // });
});

const historyForm = document.querySelector("#history-form");

function filter(e) {
  console.log('filter',e.target.id)
  e.preventDefault();

  const formData = new FormData(historyForm);

  const historyCustomerName = formData.get("historyCustomerName") || "default";
  const paymentStatus = formData.get("paymentStatus") || "default";
  const bookingStatus = formData.get("bookingStatus") || "default";
  const fromDate = formData.get("fromDate") || "default";
  const toDate = formData.get("toDate") || "default";

  const data = {
    historyCustomerName,
    paymentStatus,
    bookingStatus,
    fromDate,
    toDate,
    download: false
  };
    ipcRenderer.send("history-booking", data);
}

historyForm.addEventListener("submit", filter);

const fromDateInput = document.querySelector('#fromDate');
const toDateInput = document.querySelector('#toDate');

fromDateInput.addEventListener('change', () => {
toDateInput.min = fromDateInput.value;
});

//   reinstate client
// const reinstateForm = document.querySelector("#reinstate-booking-form");

// function reinstateClient(e) {
//   e.preventDefault();

//     const formData = new FormData(reinstateForm);
  
//     const reinstateId = formData.get("reinstateId");
//     const reinstateRoom = formData.get("reinstateRoom");
//     const checkOut = formData.get("reinstateCheckOut");
//     ipcRenderer.send("reinstate-client", {
//       reinstateId,
//       reinstateRoom,
//       checkOut,
//     });
  
// }

// reinstateForm.addEventListener("submit", reinstateClient);

// pay owed


const payForm = document.querySelector('#payCustomerForm')

function pay(e){
  e.preventDefault()
  const formData = new FormData(payForm)
  const amount = formData.get('owedAmount')
  const bookingId = formData.get('bookingId')


  ipcRenderer.send('pay-booking', {amount,bookingId})
  
}

payForm.addEventListener('submit', pay)