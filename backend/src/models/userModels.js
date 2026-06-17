import mongoose, { Schema } from "mongoose"; 

// Defines structure and validation rules for the User document in MongoDB
const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String } // Stores JWT token for session management
});

const User = mongoose.model("User", userSchema); // Creates User collection in MongoDB

export default User;