const { ipcRenderer } = require('electron');



function loadRoomStats(Rooms) {
  let countRooms = 0;
  let countAvailable = 0;
  let countBooked = 0;

  Rooms?.forEach(room => {
    countRooms++;

    if (room.dataValues.room_status == true) {
      countAvailable++;
    } else {
      countBooked++;
    }
  });

  const pieChartCanvas = document.getElementById('pie-chart');
  const pieChartData = {
    labels: ['Available Rooms', 'Booked Rooms'],
    datasets: [{
      data: [countAvailable, countBooked],
      backgroundColor: ['#36A2EB', '#FF6384']
    }]
  };

  const pieChart = new Chart(pieChartCanvas, {
    type: 'pie',
    data: pieChartData
  });
}
let totalRevenue = 0;
let totalCost = 0;
function loadBookingStats(Bookings) {
  const dates = [];
  const counts = [];

  Bookings?.forEach(booking => {
    const date = new Date(booking.dataValues.createdAt);
    const dateString = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    const index = dates.indexOf(dateString);

    if (index == -1) {
      dates.push(dateString);
      counts.push(1);
    } else {
      counts[index]++;
    }

    // Update totalRevenue with current booking amount
    totalRevenue += booking.dataValues.payed;
  });

  // Update the profit-pie-chart with the initial total revenue
  const profitPieChartCanvas = document.getElementById('profit-pie-chart');
  const profitPieChartData = {
    labels: ['Total Revenue'],
    datasets: [{
      data: [totalRevenue],
      backgroundColor: ['#4BC0C0']
    }]
  };

  const profitPieChart = new Chart(profitPieChartCanvas, {
    type: 'pie',
    data: profitPieChartData
  });
  const lineChartCanvas = document.getElementById('line-chart');
  const lineChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Number of Bookings',
        data: counts,
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
      },
    ],
  };

  const lineChart = new Chart(lineChartCanvas, {
    type: 'line',
    data: lineChartData,
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const historyCustomerName = 'default';
  const paymentStatus = 'default';
  const bookingStatus = 'default';
  const fromDate = 'default';
  const toDate = 'default';
  const initialData = {
    historyCustomerName,
    paymentStatus,
    bookingStatus,
    fromDate,
    toDate,
  };

  ipcRenderer.send('history-booking', initialData);
  ipcRenderer.send('all-rooms');

  ipcRenderer.on('history-booking-res', async(event, res) => {
    const { Bookings } = res;
    loadBookingStats(Bookings);
  });

  ipcRenderer.on('rooms-res', async(event, res) => {
    const { Rooms } = res;
    loadRoomStats(Rooms);
  });

  // Add event listener to the "Add" button for cost input
  const addCostBtn = document.getElementById('add-cost-btn');
  addCostBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('name-input');
    const amountInput = document.getElementById('amount-input');

    const name = nameInput.value;
    const amount = Number(amountInput.value);

    if (name.trim() === '' || isNaN(amount)) {
      alert('Please enter valid cost name and amount');
      return;
    }

    // Update totalCost with the new cost amount
    totalCost += amount;

    // Update profitPieChartData with new total profit value
    const profitPieChartData = {
      labels: [ 'Total Cost', 'Profit'],
      datasets: [{
        data: [ totalCost, totalRevenue - totalCost],
        backgroundColor: [ '#4BC0C0', '#00bcd4'],
      }]
      };

      // Update the pie chart
const pieChart = new Chart(document.getElementById('profit-pie-chart').getContext('2d'), {
  type: 'pie',
  data: profitPieChartData,
});

// Reset input fields
nameInput.value = '';
amountInput.value = '';
});
});
