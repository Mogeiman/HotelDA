const {ipcRenderer} = require('electron')

const logContainer = document.querySelector('.log-container')

function renderLogs(logs){
    logContainer.innerHTML = `
      <div class="row log-header sticky-top bg-white p-0 z-100" style="position: sticky; top: 0; background-color: #f8f9fa;">
        <div class="col-md-2"><strong>Date</strong></div>
        <div class="col-md-2"><strong>Action</strong></div>
        <div class="col-md-6"><strong>Details</strong></div>
      </div>
    `
  
    logs?.forEach(log => {
      const createdAt = log.dataValues.createdAt;
      const date = new Date(createdAt);
  
      const day = date.toLocaleString('en-us', {weekday: 'short'});
      const monthDay = date.toLocaleString('en-us', {month: 'short', day: 'numeric'});
      const year = date.getFullYear();
  
      const formattedDate = `${day}, ${monthDay} ${year}`;
  
      const actionClass = log.dataValues.action === 'Delete' ? 'text-danger' :
                          log.dataValues.action === 'Checkout' ? 'text-primary' :
                          log.dataValues.action === 'Create' ? 'text-success' :
                          log.dataValues.action === 'Pay' ? 'text-warning' :
                          log.dataValues.action === 'Edit' ? 'text-info'  : '';
  
      const div = document.createElement('div')
      div.classList.add('row', 'mt-1')
  
      div.innerHTML = `
        <div class="col-md-2 ">${formattedDate}</div>
        <div class="col-md-2 ${actionClass}">${log.dataValues.action}</div>
        <div class="col-md-6 ">${log.dataValues.details}</div>
      `
  
      logContainer.appendChild(div)
    });
  }
  


document.addEventListener('DOMContentLoaded',()=>{
    ipcRenderer.send('all-logs')
    ipcRenderer.on('all-logs-res', (event, res)=>{
        if(res.logs){
            const {logs} = res
            renderLogs(logs)
        }else{
            console.log('no logs')
        }
    })

})