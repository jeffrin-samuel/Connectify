import mongoose, { Schema } from "mongoose"; 

// Defines structure and validation rules for the User document in MongoDB
const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tokenVersion: {type: Number, default: 0},
});

const User = mongoose.model("User", userSchema); // Creates User collection in MongoDB

export default User;