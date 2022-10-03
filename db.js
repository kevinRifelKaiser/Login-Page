
import mongoose from 'mongoose';
//const { default: mongoose } = require('mongoose');

mongoose.connect('mongodb://mongo:Cq7Ogv08a3j5QjGlpop3@containers-us-west-66.railway.app:6971' || 'mongodb://localhost:27017/userDB');
//mongoose.set('useCreateIndex', true);

//Mongoose Schema and Model.
export const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  //Agregamos el campo googleId para poder usearlo en la función findOrCreate.
  googleId: String,
  secret: String
});