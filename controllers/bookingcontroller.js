const {DataTypes} = require('sequelize')
const {ipcMain } = require('electron')
const {sequelize} = require('../models')


const addCustomer = () =>{
    ipcMain.on('add-customer', async(event,{fullname, room, cost, phonenumber, checkin, checkout}) => {                
      const  Customer  = require('../models/customer')(sequelize, DataTypes);
      const  Room  = require('../models/room')(sequelize, DataTypes);
      const  Logs  = require('../models/logs')(sequelize, DataTypes);
      const action = "Create"
      // Calculate total nights stayed
      const checkinDate = new Date(checkin);
      const checkoutDate = new Date(checkout);
      const totalNights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
  
      // Calculate total cost and owed amount
      const totalCost = totalNights * cost;
      const details = `${fullname} has booked room ${room}`
      try {
        // Create customer and update room status
        await Customer.create({
          fullname: fullname,
          phonenumber: phonenumber,
          room_no: room,
          costpernight: cost,
          payed: 0,
          total_cost: totalCost, 
          owed: totalCost,
          customer_status: true,
          checkout
        });
        await Logs.create({
          action,
          details
        })
        await Room.update({ room_status: 0 }, { where: { room_no: room } });
  
        // Emit event to update list of customers
        event.sender.send('create-customer-res', {status: true});
      } catch (err) {
        console.log(err)
        event.sender.send('create-customer-res', {status: false, message: 'unknown error occured'});
      }
    })
  }

  const allBooking = () =>{
    ipcMain.on('all-booking', async(event, data)=>{
        const  Customer  = require('../models/customer')(sequelize, DataTypes);
        const customerStatus = 1;
        try{
            const Bookings = await Customer.findAll({where:{customer_status: customerStatus},
              order: [['updatedAt', 'DESC']]})
            if(!Bookings){
                event.sender.send('bookings-res', {message: 'No bookings at the moment'})
            }else{
                event.sender.send('bookings-res', {Bookings})
            }
        }catch(err){
            console.log(err)
        }

    })
  }

  const payBooking = () =>{
    ipcMain.on('pay-booking', async(event, {bookingId, amount})=>{
      const  Customer  = require('../models/customer')(sequelize, DataTypes);
      const  Logs  = require('../models/logs')(sequelize, DataTypes);
      const action = "Pay"

      try{
        const booking = await Customer.findOne({where:{id: bookingId}})
        if(!booking){
          event.sender.send('pay-booking-res', {status: false, message: 'an error has occured'})
        }else{
          const newPayed = booking.payed + Number(amount);
          const newOwed = booking.owed - Number(amount);
          const details = `${booking.fullname} has payed ${amount}. They now owe SSH ${newOwed}`
          await Customer.update({ payed: newPayed, owed: newOwed}, { where: { id: bookingId } });
          await Logs.create({
            action,
            details
          })
          event.sender.send('pay-booking-res', {status: true, message: 'booking payment successful'})
        }
      }catch(err){
        console.log(err)
      }
    })
  }

  const editBooking = () =>{
    ipcMain.on('edit-booking', async(event,{fullname, phonenumber, checkout, bookingId})=>{
      const  Customer  = require('../models/customer')(sequelize, DataTypes);
      const  Logs  = require('../models/logs')(sequelize, DataTypes);
      const action = "Edit"
      try{ 
        const Booking = await Customer.findOne({where: {id: bookingId}})
        const payed = Booking.payed
        const costpernight = Booking.costpernight
        const checkedIn = Booking.createdAt
        const checkoutTimestamp = new Date(checkout).getTime() // convert to timestamp
        const daysOfStay = Math.ceil((checkoutTimestamp - checkedIn) / (1000 * 60 * 60 * 24))
        const newTotalCost = daysOfStay * costpernight
        const newOwed = newTotalCost - payed
        const details = `${Booking.fullname} has been edited.`
        console.log(payed, ' ', costpernight, ' ', checkedIn, ' ', daysOfStay, ' ', newTotalCost, ' ', newOwed)
          await Customer.update({
            fullname, 
            phonenumber, 
            checkout, 
            total_cost: newTotalCost,
            owed: newOwed
          },
            {where: {id: bookingId}})
            await Logs.create({
              action,
              details
            })
          event.sender.send('edit-booking-res', {status: true, message: 'booking updated successful'})

        }catch(err){
          console.log(err)
        }
    })
   
  }

  const checkOut = () =>{
    ipcMain.on('checkOut-booking', async(event, {bookingId, roomno, amount})=>{
          const  Customer  = require('../models/customer')(sequelize, DataTypes);
          const  Room  = require('../models/room')(sequelize, DataTypes);
          const  Logs  = require('../models/logs')(sequelize, DataTypes);
          const action = "Checkout"

          try{
            const Booking = await Customer.findOne({where: {id: bookingId}})
            const oldPayed = Booking.payed
            const newPayed = oldPayed + Number(amount)
            const oldOwed = Booking.owed
            const newOwed = oldOwed - Number(amount)
            const details = ` ${Booking.fullname}  has been checked out`

              await Customer.update({customer_status: 0, payed: newPayed, owed: newOwed}, {where : {id: bookingId}})
              await Room.update({room_status: 1}, {where: {room_no: roomno}})
              await Logs.create({
                action,
                details
              })
              event.sender.send('checkOut-booking-res', {status: true})
          }catch(err){
            console.log(err)
          }
    })

  }

  const deleteBooking = () => {
    ipcMain.on('delete-booking', async(event, {bookingId, roomno})=>{
      const  Customer  = require('../models/customer')(sequelize, DataTypes);
      const  Room  = require('../models/room')(sequelize, DataTypes);
      const  Logs  = require('../models/logs')(sequelize, DataTypes);

      const action = "Delete"
      try{
        const Customers = await Customer.findByPk(bookingId)
        const details = ` ${Customers.fullname} booking has been deleted`
        await Customer.destroy({where :{id: bookingId}})
        await Room.update({room_status: true}, {where: {room_no: roomno}})
        await Logs.create({
          action,
          details
        })
        event.sender.send('delete-booking-res', {status: true})
      }catch(err){
        console.log(err)
      }
    })
  }
  

  const historyBooking = () => {
    ipcMain.on('history-booking', async (event, { historyCustomerName, bookingStatus, paymentStatus, fromDate, toDate }) => {
      const Customer = require('../models/customer')(sequelize, DataTypes);
      const { Op } = require('sequelize');
  
      try {
        // Create an empty object to hold the filters that will be applied
        const filters = {};
  
        // Check each filter field in the form and add it to the filters object if it has a value
        if (historyCustomerName !== 'default' && historyCustomerName !== null) {
          filters.fullname = {
            [Op.like]: `%${historyCustomerName}%`
          };
        }
        if (bookingStatus !== 'default' && bookingStatus !== null) {
          filters.customer_status = Number(bookingStatus);
        }
        if (paymentStatus !== 'default' && paymentStatus !== null) {
          if (paymentStatus == 0) {
            filters.owed = {
              [Op.gt]: 0
            };
          } else {
            filters.owed = {
              [Op.eq]: 0
            };
          }
        }
        if (fromDate !== 'default' && fromDate !== null) {
          filters.createdAt = {
            [Op.gte]: new Date(fromDate)
          };
        } else {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filters.createdAt = {
            [Op.gte]: thirtyDaysAgo
          };
        }
        if (toDate !== 'default' && toDate !== null) {
          if (filters.createdAt) {
            filters.createdAt[Op.lte] = new Date(toDate);
          } else {
            filters.createdAt = {
              [Op.lte]: new Date(toDate)
            };
          }
        } else {
          filters.createdAt[Op.lte] = new Date();
        }
        
  
        const Bookings = await Customer.findAll({
          where: filters,
          order: [['updatedAt', 'DESC']]
        });
  
        if (!Bookings || Bookings.length === 0) {
          event.sender.send('history-booking-res', { status: false, message: 'No bookings at the moment' });
        } else {
          event.sender.send('history-booking-res', { status: true, Bookings });
        }
      } catch (err) {
        console.log(err);
      }
    });
  };
  
  const reinstateClient = () =>{
    ipcMain.on('reinstate-client', async(event,{reinstateId, reinstateRoom, checkOut}) => {                
      const  Customer  = require('../models/customer')(sequelize, DataTypes);
      const  Room  = require('../models/room')(sequelize, DataTypes);
      const  Logs  = require('../models/logs')(sequelize, DataTypes);
      const action = "Reinstate"
      // Calculate total nights stayed
      const Booking = await Customer.findOne({where: {id: reinstateId}})
      const checkin = Booking.createdAt
      const checkinDate = new Date(checkin);
      const checkoutDate = new Date(checkOut);
      const totalNights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
  
      // Calculate total cost and owed amount
      const totalCost = totalNights * Booking.costpernight;
      const newOwed = totalCost - Number(Booking.payed)

      const details = `${Booking.fullname} has been reinstated to room ${reinstateRoom}`
      try {
        // Create customer and update room status
        await Customer.update({
          room_no: reinstateRoom,
          total_cost: totalCost, 
          owed: newOwed,
          customer_status: true,
          checkout: checkoutDate
        }, {
          where: {
            id: reinstateId
          }
        });
        await Logs.create({
          action,
          details
        })
        await Room.update({ room_status: 0 }, { where: { room_no: reinstateRoom } });
  
        // Emit event to update list of customers
        event.sender.send('reinstate-client-res', {status: true, message: 'successfully reinstated'});
      } catch (err) {
        console.log(err)
        event.sender.send('reinstate-client-res', {status: false, message: 'unknown error occured'});
      }
    })
  }

module.exports = {addCustomer, allBooking, payBooking, editBooking, checkOut, deleteBooking, historyBooking, reinstateClient}