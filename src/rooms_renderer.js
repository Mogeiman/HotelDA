const { ipcRenderer } = require('electron');

function renderRooms(Rooms) {
  const tableResponsive = document.querySelector('.table-responsive');
  tableResponsive.innerHTML = '';
  if (Rooms && Rooms.length > 0) {
    const deck = document.createElement('div');
    deck.classList.add('row', 'overflow-x-hidden', 'container-fluid');
    Rooms.forEach((room) => {
      const divCol = document.createElement('div');
      divCol.classList.add('col-xl-3', 'col-lg-6', 'mb-4');
      const divCard = document.createElement('div');
      divCard.classList.add('card', 'card-stats', 'h-100', room.dataValues.room_status === 0 ? 'border-danger' : 'border-success');
      const divBadge = document.createElement('div');
      divBadge.classList.add('position-absolute', 'top-0', 'right-0', 'mt-1', 'mr-1');
      divBadge.innerHTML = `<div class="rounded-circle bg-${room.dataValues.room_status === 0 ? 'danger' : 'success'}" style="width: 10px; height: 10px;"></div>`;
      const divHeader = document.createElement('div');
      divHeader.classList.add('card-header', 'bg-transparent', 'text-center' , room.dataValues.room_status === 0 ? 'border-danger' : 'border-success');
      const h4 = document.createElement('h2');
      h4.classList.add('mb-0', room.dataValues.room_status === 0 ? 'border-danger' : 'border-success')
      h4.innerText = room.dataValues.room_no;
      const divBody = document.createElement('div');
      divBody.classList.add('card-body');
      const divButtons = document.createElement('div');
      divButtons.classList.add('d-flex', 'justify-content-end');
      const deleteButton = document.createElement('button');
      deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'delete-room-btn','delete-room');
      deleteButton.setAttribute('data-id', room.dataValues.id);
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      const editButton = document.createElement('button');
      editButton.setAttribute('data-id', room.dataValues.id);
      editButton.setAttribute('data-roomno', room.dataValues.room_no);
      editButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'edit-room-btn', 'edit-room');
      editButton.innerHTML = '<i class="fas fa-user-edit"></i>';

      divHeader.appendChild(h4);
      divCol.appendChild(divCard);
      divCard.appendChild(divBadge);
      divCard.appendChild(divHeader);
      divButtons.appendChild(deleteButton);
      divButtons.appendChild(editButton);
      divBody.appendChild(divButtons);
      divCard.appendChild(divBody);
      deck.appendChild(divCol);
    });
    tableResponsive.appendChild(deck);

    // modal functions
    const deleteRoomButton = tableResponsive.querySelectorAll('.delete-room');
    deleteRoomButton.forEach((deleteRoomButton) => {
      deleteRoomButton.addEventListener('click', () => {
        // Retrieve fullname and id from data attributes
        const id = deleteRoomButton.dataset.id;
        
        ipcRenderer.send('delete-room', {id})

      });
    });
    const editBookingButtons = tableResponsive.querySelectorAll('.edit-room');
    editBookingButtons.forEach((editBookingButton) => {
      editBookingButton.addEventListener('click', () => {
        $("#editModal").modal("show");

        // Retrieve fullname and id from data attributes
        const id = editBookingButton.dataset.id;
        const roomno = editBookingButton.dataset.roomno;
        // Set values in modal inputs
        $("#editRoomId").val(id); // Assumes you're using jQuery
        $("#editRoomNo").val(roomno); // Assumes you're using jQuery
      });
    });
  } else {
    console.log('No rooms created');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // delete room
  ipcRenderer.on('delete-room-res', async(even, res)=>{
    ipcRenderer.send('all-rooms')
    alert(res.message)
    $("#editModal").modal("hide");

  })
  // edit room
  ipcRenderer.on('edit-room-res', async(event, res)=>{
    if(res.status == true){
      ipcRenderer.send('all-rooms')
      alert('Room successfuly updated')
      $("#editModal").modal("show");

    }else{
      alert('an error occured')
    }
  })
  ipcRenderer.send('all-rooms');
  ipcRenderer.on('rooms-res', async(event, data) => {
    const { Rooms } = data;
    renderRooms(Rooms);
  });

  ipcRenderer.on('create-room-res', (event, res) => {
    if (res.state == true) {
      ipcRenderer.send('all-rooms');
      alert('room created');
    } else {
      const errorDiv = document.createElement('div');
      errorDiv.classList.add('alert', 'alert-danger');
      errorDiv.textContent = res.message;
      document.body.appendChild(errorDiv); // display the error message
    }
  });
});

const addRoomForm = document.querySelector('#addRoomForm');

function roomCreation(e) {
  e.preventDefault();
  const formData = new FormData(addRoomForm);
  const type = formData.get('type');
  const roomNo = formData.get('room-no');
  const roomPrice = formData.get('room-price');

  const data = {
    type,
    roomNo,
    roomPrice,
  };
  if (data) {
    ipcRenderer.send('create-room', { data });
    $('#addRoomModal').modal('hide'); // close the modal on successful submission
  } else {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('alert', 'alert-danger');
    errorDiv.textContent = 'An error occurred. Please fill all required fields.';
    addRoomForm.prepend(errorDiv); // display the error message
  }
}

addRoomForm.addEventListener('submit', roomCreation);


// edit room

const editForm = document.querySelector('#editRoomForm')

function edit(e){
  e.preventDefault()
  const formData = new FormData(editForm)
  const roomId = formData.get('editRoomId')
  const roomno = formData.get('editRoomNo')


  ipcRenderer.send('edit-room', {roomId, roomno})
}

editForm.addEventListener('submit', edit)