
function downloadAsPdf(Bookings) {
    const table = `
      <div class="container">
        <h1 class="text-center mb-5">Financial Report</h1>
        <table class="table table-bordered table-striped">
          <thead class="thead-dark">
            <tr>
              <th>Name</th>
              <th>Room No</th>
              <th>Phone Number</th>
              <th>Date</th>
              <th>Total Cost</th>
              <th>Payed</th>
              <th>Owed</th>
            </tr>
          </thead>
          <tbody>
            ${Bookings.map((booking) => {
              const createdAt = booking.dataValues.createdAt;
              const date = new Date(createdAt);
              const day = date.toLocaleString("en-us", { weekday: "short" });
              const monthDay = date.toLocaleString("en-us", {
                month: "short",
                day: "numeric",
              });
              const year = date.getFullYear();
              const formattedDate = `${day}, ${monthDay} ${year}`;
  
              const startDate = new Date(booking.dataValues.createdAt);
              const endDate = new Date(booking.dataValues.checkout);
              const diffInMs = endDate - startDate;
              const totalDays = Math.floor(diffInMs / 86400000);
  
              return `
                <tr>
                  <td>${booking.dataValues.fullname}</td>
                  <td>${booking.dataValues.room_no}</td>
                  <td>${booking.dataValues.phonenumber}</td>
                  <td>${formattedDate}</td>
                  <td>${booking.dataValues.total_cost}</td>
                  <td>${booking.dataValues.payed}</td>
                  <td>${booking.dataValues.owed}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    `;
    
    const fileName = `financial_report_${new Date().toLocaleDateString()}.pdf`;
    html2pdf(table, { filename: fileName });
  }
  

const downloadButton = document.querySelector("#downloadButton");
downloadButton.addEventListener("click", getForm);

function getForm(e) {
    e.preventDefault();
  
    // Check if the download button was clicked
    if (e.target === downloadButton) {
  
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
        };
      
        ipcRenderer.send("history-booking", data);
      
        ipcRenderer.on("history-booking-res", (event, res) => {
          const { Bookings } = res;
          downloadAsPdf(Bookings);
        });
    } else {
      // The filter button was clicked, do nothing
      return;
    }
  }
  