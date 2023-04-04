const {DataTypes} = require('sequelize')
const {ipcMain } = require('electron')
const {sequelize} = require('../models')
const bcrypt = require("bcryptjs");

const logIn= () => {
    ipcMain.on('logIn-User', async (event, {username, password}) =>{
        const  User  = require('../models/user')(sequelize, DataTypes);
        try{
            const user = await User.findOne({where: {name:username}})
            if(!user){
                event.sender.send('login-res', {state: false, message: 'user does not exist'})
            }else{
                bcrypt.compare(password, user.password).then((match)=>{
                    if(!match){
                        event.sender.send('login-res', {state: false, message: 'Password is wrong'})
                    }
                    else{

                        event.sender.send('login-res', {state: true, user: User.name})
                    }
                })
            }
        }catch(err){
            console.log(err)
            event.sender.send('login-res', {state: false, message: 'unknown error occured'})
        }
      

    })
}

const signUp = () =>{
    ipcMain.on('create-user', async (event, { username, password }) => {
    const  User  = require('../models/user')(sequelize, DataTypes);
   // Import the User model here 
    try{
      bcrypt.hash(password, 10).then((hash)=>{
      User.create({ name: username, password: hash });
      event.sender.send('signup-res', {state: true});})
    }catch(err){
      event.sender.send('signup-res', {state: false, message: 'unknown error occured'});
    }
    })}

    module.exports = {logIn, signUp}