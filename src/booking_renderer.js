const { ipcRenderer } = require('electron');
const select = document.querySelector('select');


//rooms
function renderRooms(Rooms) {
  select.innerHTML = '<option value="">Select Room</option>';
  if (Rooms && Rooms.length > 0) {
    Rooms.forEach((room) => {
      if (room.dataValues.room_status === 1) {
        const option = document.createElement('option');
        option.value = room.dataValues.room_no;
        option.text = `Room ${room.dataValues.room_no}`;
        select.appendChild(option);
      }
    });
  } else {
    alert('No rooms created');
  }
}    
//booking

const tbody = document.getElementById('tbody')
function renderCustomers(Bookings){
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
                      <td>${formattedDate}</td> 
                      <td>${booking.dataValues.total_cost}</td> 
                      <td>${booking.dataValues.payed}</td> 
                      <td>${booking.dataValues.owed}</td> 
                      <td> 
                      <button name="checkOut" class="btn btn-sm btn-danger checkOut-booking" 
                        data-owed=${booking.dataValues.owed} 
                        data-total=${booking.dataValues.total_cost} 
                        data-payed=${booking.dataValues.payed} 
                        data-id="${booking.dataValues.id}" 
                        data-roomno="${booking.dataValues.room_no}" 
                        data-fullname="${booking.dataValues.fullname}" 
                        data-phonenumber="${booking.dataValues.phonenumber}"> 
                        <i class="fas fa-check"></i></button> 
                      <button name="edit" class="btn btn-sm btn-warning edit-booking" 
                        data-roomno="${booking.dataValues.room_no}" 
                        data-id="${booking.dataValues.id}" 
                        data-fullname="${booking.dataValues.fullname}" 
                        data-phonenumber="${booking.dataValues.phonenumber}"
                        data-checkout="${booking.dataValues.checkout}">
                        <i class="fas fa-user-edit"></i></button>
                      <button name="pay" class="btn btn-sm btn-success pay-booking" 
                        data-owed=${booking.dataValues.owed} 
                        data-fullname="${booking.dataValues.fullname}" 
                        data-id="${booking.dataValues.id}">
                        <i class="fas fa-money-bill-wave"></i></button>                  
                      </td>`
     
          tbody.appendChild(tr)

          // Pay modal
          const payBookingButton = tr.querySelector('.pay-booking');
          payBookingButton.addEventListener('click', () => {
              // Show the payModal
              $("#payModal").modal("show");

              // Retrieve fullname and id from data attributes
              const fullname = payBookingButton.dataset.fullname;
              const id = payBookingButton.dataset.id;
              const owed = payBookingButton.dataset.owed

              $("#bookingId").val(id); // Assumes you're using jQuery
              $("#customerName").val(fullname); // Assumes you're using jQuery
              const amount = document.querySelector('#amount');
              amount.max = owed;  
            });

            const editBookingButton = tr.querySelector('.edit-booking');
            editBookingButton.addEventListener('click', () => {
              $("#editModal").modal("show");
            
              // Retrieve fullname and id from data attributes
              const fullname = editBookingButton.dataset.fullname;
              const id = editBookingButton.dataset.id;
              const checkout = editBookingButton.dataset.checkout;
              const phonenumber = editBookingButton.dataset.phonenumber;
            
              // Format checkout date
              const checkoutDate = new Date(checkout);
              const formattedCheckout = checkoutDate.toISOString().slice(0, 10);            
              // Set values in modal inputs
              $("#editBookingId").val(id);
              $("#editFullname").val(fullname);
              $("#checkout").val(formattedCheckout);
              $("#phonenumber").val(phonenumber);
            }); 

          const checkOutButton = tr.querySelector('.checkOut-booking');
          checkOutButton.addEventListener('click', ()=>{
            $("#checkOutModal").modal("show");

              // Retrieve fullname and id from data attributes
              const fullname = checkOutButton.dataset.fullname;
              const id = checkOutButton.dataset.id;
              const checkout = checkOutButton.dataset.checkout;
              const phonenumber = checkOutButton.dataset.phonenumber
              const owed = checkOutButton.dataset.owed
              const total = checkOutButton.dataset.total
              const payed = checkOutButton.dataset.payed
              const roomno = checkOutButton.dataset.roomno
              // Set values in modal inputs
              $("#bookingCheckOutId").val(id); // Assumes you're using jQuery
              $("#checkOutFullname").val(fullname); // Assumes you're using jQuery
              $("#checkout").val(checkout); // Assumes you're using jQuery
              $("#checkOutPhonenumber").val(phonenumber); // Assumes you're using jQuery
              $("#total").val(total); // Assumes you're using jQuery
              $("#payed").val(payed); // Assumes you're using jQuery
              $("#daysOfStay").val(totalDays); // Assumes you're using jQuery
              $("#owed").val(owed); // Assumes you're using jQuery
              $("#roomno").val(roomno); // Assumes you're using jQuery
              const checkOutPayAmount = document.querySelector('#checkOutPayAmount');
              checkOutPayAmount.max = owed;           
            })
      });
  }
}

//functions
document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('all-booking')
  ipcRenderer.send('all-rooms');
  // delete Booking
  ipcRenderer.on('delete-booking-res', async(event, res)=>{
    console.log(res.status)
    if(res.status == true){
      ipcRenderer.send('all-booking')
      $('#editModal').modal('hide')
      alert('booking successfully deleted')
   }else{
     alert('an error occured')
   }
  })
  // checkOut Booking
  ipcRenderer.on('checkOut-booking-res', async(event, res)=>{
    if(res.status == true){
      ipcRenderer.send('all-booking')
      $('#checkOutModal').modal('hide')
      alert('booking successfully checked out')
    }
  })
  // edit booking
  ipcRenderer.on('edit-booking-res', async(event, res)=>{
    if(res.status == true){
       ipcRenderer.send('all-booking')
       $('#editModal').modal('hide')
       alert('booking successfully edited')
    }else{
      alert('an error occured')
    }
  })
  // pay booking
  ipcRenderer.on('pay-booking-res', async(event, res)=>{
    if(res.status == true){
      $("#amount").val('');
      ipcRenderer.send('all-booking')
      $('#payModal').modal('hide'); // close the modal on successful submission
       alert('payment sent')
      }
    else {
      $('#payModal').modal('hide'); // close the modal on successful submission
      alert('an error occured')
    }
      })
    // Add event listener to refresh list of customers when a new customer is added
    ipcRenderer.on('bookings-res', async(event,data)=>{
      try{
        const {Bookings} = data;
        renderCustomers(Bookings)
      }catch(err){
        console.log(err)
      }
       
    });
    //add booking
    ipcRenderer.on('create-customer-res', async(event, res)=>{
      try{
        if(res.status == true){
          ipcRenderer.send('all-booking');
          addCustomerForm.reset()
        }else{
          const errorDiv = document.createElement('div')
          errorDiv.classList.add('alert', 'alert-danger');
          errorDiv.textContent = res.message;
          document.body.appendChild(errorDiv);
          }
      }catch(err){
        console.log(err)
      }
       //rooms
    })
    // rooms
    ipcRenderer.on('rooms-res', (event, data) => {
        const { Rooms } = data;
        renderRooms(Rooms);
    });
});

//add booking
const addCustomerForm = document.querySelector('#addCustomerForm');

function addCustomer(e) {
  e.preventDefault();
  const formData = new FormData(addCustomerForm);
  const fullname = formData.get('fullname');
  const room = formData.get('room');
  const phonenumber = formData.get('phonenumber');
  const cost = formData.get('cost');
  const checkin = formData.get('checkin');
  const checkout = formData.get('checkout');



  // Check if fullname exists before submitting the form
  if (fullname) {
    ipcRenderer.send('add-customer', {
      fullname,
      room,
      phonenumber,
      cost,
      checkin,
      checkout,
    });
    $('#addCustomerModal').modal('hide'); // close the modal on successful submission
  } else {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('alert', 'alert-danger');
    errorDiv.textContent = 'An error occurred. Please fill all required fields.';
    addCustomerForm.prepend(errorDiv); // display the error message
  }

  const clearFullname = document.getElementById('fullname');

    console.log(clearFullname.value)

}

addCustomerForm.addEventListener('submit', addCustomer);

// Get today's date
const today = new Date().toISOString().slice(0, 10);

// Set the minimum date for checkin input
const checkinInput = document.querySelector('#Checkin');
checkinInput.setAttribute('min', today);

// Add event listener to checkin input to prevent checkout from being before it
checkinInput.addEventListener('change', () => {
  const checkinDate = new Date(checkinInput.value);
  const minCheckoutDate = new Date(checkinDate.getTime() + 86400000).toISOString().slice(0, 10);
  const checkoutInput = document.querySelector('#Checkout');
  checkoutInput.setAttribute('min', minCheckoutDate);
});

// Add event listener to checkout input to prevent today's date or before from being selected
const checkoutInput = document.querySelector('#Checkout');
checkoutInput.setAttribute('min', today);
checkoutInput.addEventListener('change', () => {
  const checkoutDate = new Date(checkoutInput.value);
  const checkinDate = new Date(checkinInput.value);
  if (checkoutDate <= checkinDate || checkoutDate.getTime() === new Date(today).getTime()) {
    checkoutInput.value = '';
  }
});



//pay booking

const payForm = document.querySelector('#payCustomerForm')

function pay(e){
  e.preventDefault()
  const formData = new FormData(payForm)
  const amount = formData.get('amount')
  const bookingId = formData.get('bookingId')


  ipcRenderer.send('pay-booking', {amount,bookingId})
  
}

payForm.addEventListener('submit', pay)


//edit booking

const editForm = document.querySelector('#editCustomerForm')

function edit(e){
  e.preventDefault()
  const formData = new FormData(editForm)
  const fullname = formData.get('editFullname')
  const phonenumber = formData.get('phonenumber')
  const checkout = formData.get('checkout')
  const bookingId = formData.get('editBookingId')

  ipcRenderer.send('edit-booking', {bookingId, fullname, phonenumber, checkout})
}

editForm.addEventListener('submit', edit)

// checkout booking

const checkOutForm = document.querySelector('#checkOutForm')

function checkOut(e){
  e.preventDefault()
  const formData = new FormData(checkOutForm)
  const roomno = formData.get('roomno')
  const amount = formData.get('checkOutPayAmount')
  const bookingId = formData.get('bookingCheckOutId')

  ipcRenderer.send('checkOut-booking', {bookingId, roomno, amount})
}

checkOutForm.addEventListener('submit', checkOut)


// delete Booking


function onDeleteClicked() {
  var bookingId = document.getElementById('editBookingId').value;
  const roomno = document.getElementById('editRoomno').value;
  ipcRenderer.send('delete-booking', {bookingId, roomno})
}
document.getElementById('deleteBooking').addEventListener('click', onDeleteClicked);
