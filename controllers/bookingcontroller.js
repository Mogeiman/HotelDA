const {ipcMain } = require('electron')
const { Customer, Logs, Room} = require('../models')
const { Op } = require('sequelize');
const cron = require('node-cron');


const addCustomer = () =>{
    ipcMain.on('add-customer', async(event,{fullname, room, cost, phonenumber}) => {                
      const action = "Create"
      // Calculate total cost and owed amount
      const details = `${fullname} has booked room ${room}`
      try {
        // Create customer and update room status
        await Customer.create({
          fullname: fullname,
          phonenumber: phonenumber,
          room_no: room,
          costpernight: cost,
          payed: 0,
          total_cost: cost, 
          owed: cost,
          customer_status: true,
        });
        await Logs.create({
          action,
          details
        })
        await Room.update({ room_status: 0 }, { where: { room_no: room } });
  
        // Emit event to update list of customers
        event.sender.send('create-customer-res', {status: true, message: 'Booking Successful'});
      } catch (err) {
        console.log(err)
        event.sender.send('create-customer-res', {status: false, message: 'unknown error occured'});
      }
    })
  }

  const allBooking = () =>{
    ipcMain.on('all-booking', async(event, data)=>{
        const customerStatus = 1;
        try{
            const Bookings = await Customer.findAll({where:{customer_status: customerStatus},
              order: [['updatedAt', 'DESC']]})
            if(!Bookings){
                event.sender.send('bookings-res', {status:false, message: 'No bookings at the moment'})
            }else{
                event.sender.send('bookings-res', {Bookings, status: true, message: 'Bookings Loaded'})
            }
        }catch(err){
            console.log(err)
        }

    })
  }

  const payBooking = () =>{
    ipcMain.on('pay-booking', async(event, {bookingId, amount})=>{
      const action = "Pay"

      try{
        const booking = await Customer.findOne({where:{id: bookingId}})
        if(!booking){
          event.sender.send('pay-booking-res', {status: false, message: 'Payment Unsuccessful'})
        }else{
          const newPayed = booking.payed + Number(amount);
          const newOwed = booking.owed - Number(amount);
          const details = `${booking.fullname} has payed ${amount}. They now owe SSH ${newOwed}`
          await Customer.update({ payed: newPayed, owed: newOwed}, { where: { id: bookingId } });
          await Logs.create({
            action,
            details
          })
          event.sender.send('pay-booking-res', {status: true, message: 'Booking Payment Successful'})
        }
      }catch(err){
        console.log(err)
      }
    })
  }

  const editBooking = () =>{
    ipcMain.on('edit-booking', async(event,{fullname, phonenumber, bookingId})=>{
      const action = "Edit"
      try{ 
        const Booking = await Customer.findOne({where: {id: bookingId}})
        const details = `${Booking.fullname} has been edited.`
          await Customer.update({
            fullname, 
            phonenumber, 
          },
            {where: {id: bookingId}})
            await Logs.create({
              action,
              details
            })
          event.sender.send('edit-booking-res', {status: true, message: 'Booking Updated Successfully'})

        }catch(err){
          console.log(err)
          event.sender.send('edit-booking-res', {status: false, message: 'Booking Unsuccessfully'})
        }
    })
   
  }

  const checkOut = () =>{
    ipcMain.on('checkOut-booking', async(event, {bookingId, roomno, amount})=>{
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
              event.sender.send('checkOut-booking-res', {status: true, message: 'Booking Successfully Checked Out'})
          }catch(err){
            console.log(err)
            event.sender.send('checkOut-booking-res', {status: false, message: 'Check Out Unsuccessful'})

          }
    })

  }

  const deleteBooking = () => {
    ipcMain.on('delete-booking', async(event, {bookingId, roomno})=>{
      const action = "Delete"
      try{
        const Customers = await Customer.findByPk(bookingId)
        const details = ` ${Customers.fullname} booking has been deleted`
        await Customer.destroy({where :{id: bookingId}})
        await Room.update({room_status: 1}, {where: {room_no: roomno}})
        await Logs.create({
          action,
          details
        })
        event.sender.send('delete-booking-res', {status: true, message: 'Booking Successfully Deleted'})
      }catch(err){
        console.log(err)
        event.sender.send('delete-booking-res', {status: true, message: 'Unable To Delete Booking'})
      }
    })
  }
  

  const historyBooking = () => {
    ipcMain.on('history-booking', async (event, { historyCustomerName, bookingStatus, paymentStatus, fromDate, toDate, download }) => {      
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
          event.sender.send('history-booking-res', { status: true, Bookings , message: 'Bookings Successfully Loaded'});
          if(download){
            event.sender.send('download-history-booking-res', { status: true, Bookings , message: 'Bookings Successfully Loaded'});

          }
        }
      } catch (err) {
        console.log(err);
      }
    });
  };
  
  // const reinstateClient = () =>{
  //   ipcMain.on('reinstate-client', async(event,{reinstateId, reinstateRoom}) => {                
  //     const  Customer  = require('../models/customer')(sequelize, DataTypes);
  //     const  Room  = require('../models/room')(sequelize, DataTypes);
  //     const  Logs  = require('../models/logs')(sequelize, DataTypes);
  //     const action = "Reinstate"
  //     // Calculate total nights stayed
  //     const Booking = await Customer.findOne({where: {id: reinstateId}})
  //     const checkin = Booking.createdAt
  //     const checkinDate = new Date(checkin);
  //     const checkoutDate = new Date(checkOut);
  //     const totalNights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
  
  //     // Calculate total cost and owed amount
  //     const totalCost = totalNights * Booking.costpernight;
  //     const newOwed = totalCost - Number(Booking.payed)

  //     const details = `${Booking.fullname} has been reinstated to room ${reinstateRoom}`
  //     try {
  //       // Create customer and update room status
  //       await Customer.update({
  //         room_no: reinstateRoom,
  //         total_cost: totalCost, 
  //         owed: newOwed,
  //         customer_status: true,
  //         checkout: checkoutDate
  //       }, {
  //         where: {
  //           id: reinstateId
  //         }
  //       });
  //       await Logs.create({
  //         action,
  //         details
  //       })
  //       await Room.update({ room_status: 0 }, { where: { room_no: reinstateRoom } });
  
  //       // Emit event to update list of customers
  //       event.sender.send('reinstate-client-res', {status: true, message: 'Booking Successfully Reinstated'});
  //     } catch (err) {
  //       console.log(err)
  //       event.sender.send('reinstate-client-res', {status: false, message: 'unknown error occured'});
  //     }
  //   })
  // }


  const updateBookingScheduled = () => {
    cron.schedule('0 */3 * * *', async () => {
      const bookings = await Customer.findAll({where: {customer_status: true}});
      bookings.forEach(async (booking) => {
        const checkInDate = booking.createdAt;
        const today = new Date();
        const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
        const diffDays = Math.round(Math.abs((today - checkInDate) / oneDay));
        const totalOwed = (diffDays <= 0) ? booking.costpernight : diffDays * booking.costpernight;
        const newOwed = Number(totalOwed-booking.payed)
        await booking.update({ total_cost: totalOwed, owed: newOwed });
      });
    });
  };
  

  const updateBookingsOnReady = async () => {
    const bookings = await Customer.findAll({where: {customer_status: true}});
    for (const booking of bookings) {
      const checkInDate = booking.createdAt;
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
      const diffDays = Math.round(Math.abs((today - checkInDate) / oneDay));
      const totalOwed = (diffDays <= 0) ? booking.costpernight : diffDays * booking.costpernight;
      const newOwed = Number(totalOwed-booking.payed)
      await booking.update({ total_cost: totalOwed, owed: newOwed });
    }
  };
  

module.exports = {
                  addCustomer,
                  allBooking, 
                  payBooking, 
                  editBooking, 
                  checkOut, 
                  deleteBooking, 
                  historyBooking, 
                  // reinstateClient,
                  updateBookingScheduled,
                  updateBookingsOnReady
                }