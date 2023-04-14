const {DataTypes} = require('sequelize')
const {ipcMain } = require('electron')
const {sequelize} = require('../models')

const createRoom = () =>{
  ipcMain.on('create-room', async (event, {data}) => {
    const {roomNo, type, roomPrice} = data;
    const  Room  = require('../models/room')(sequelize, DataTypes);
    const  Logs  = require('../models/logs')(sequelize, DataTypes);
    const action = "Create"
    const details = `Room ${roomNo} has been created`
    try{
      await Room.create({
        room_no: roomNo,
        room_price: roomPrice,
        room_type: type,
        room_status: true
      })
      await Logs.create({
        action,
        details
      })
      event.sender.send('create-room-res', {state: true, message: 'Room Successfully Created'});
    }catch(err){
      event.sender.send('create-room-res', {state: false, message: 'unknown error occured'});
    }
  })
}

const allRooms = ()=>{
  ipcMain.on('all-rooms', async(event, data)=>{
    const  Room  = require('../models/room')(sequelize, DataTypes);
    try{
      const Rooms = await Room.findAll({order: [['updatedAt', 'DESC']]})
      if(!Rooms){
        event.sender.send('rooms-res', {message: 'No rooms created'})
      }else{
        event.sender.send('rooms-res', {Rooms})
      }
    }catch(err){
      console.log(err)
    }
  })
}

const editRooms = () => {
  ipcMain.on('edit-room', async(event, {roomId, roomno})=>{
     const  Room  = require('../models/room')(sequelize, DataTypes);
     const  Logs  = require('../models/logs')(sequelize, DataTypes);
     const action = "Edit"
  try{
    const rooms = await Room.findByPk(roomId)
    const details = `Room ${rooms.room_no} has been changed to ${roomno}`
    await Room.update({room_no: roomno}, {where: {id: roomId}})
    await Logs.create({
      action,
      details
    })
    event.sender.send('edit-room-res', {status: true, message: 'Room Successfully Edited'})
  }catch(err){
    console.log(err)
    event.sender.send('edit-room-res', {status: true, message: 'Unable To Edit Room'})
  }
  })
 
}

const deleteRooms = () => {
  ipcMain.on('delete-room', async(event, {id})=>{
    const  Room  = require('../models/room')(sequelize, DataTypes);
    const  Logs  = require('../models/logs')(sequelize, DataTypes);
    const action = "Delete"
    try{
      const room = await Room.findOne({where: {id}})
      if(room.room_status == 0){
        event.sender.send('delete-room-res', {status: false, message: 'Room is Occupied'})
      }else{
        const details = `Room ${room.room_no} has been deleted`
        await Logs.create({
          action,
          details
        })
        await Room.destroy({where: {id}})
        event.sender.send('delete-room-res', {status:true, message: 'Room Successfully Deleted'})
      }
    }catch(err){
      console.log(err)
    }
  })
}
module.exports = {createRoom, allRooms, editRooms, deleteRooms}
