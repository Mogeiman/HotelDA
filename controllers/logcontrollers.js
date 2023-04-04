const {DataTypes} = require('sequelize')
const {ipcMain } = require('electron')
const {sequelize} = require('../models')

const allLogs = () => {
    ipcMain.on('all-logs', async(event, data)=>{
        const  Logs  = require('../models/logs')(sequelize, DataTypes);
        try{
            const logs = await Logs.findAll({order: [['updatedAt', 'DESC']]})
            if(logs){
                event.sender.send('all-logs-res', {logs})
            }else{
                event.sender.send('all-logs-res', {message: 'no logs at the moment'})
            }
        }catch(err){
            console.log(err)
        }
    })
}

module.exports = {allLogs}