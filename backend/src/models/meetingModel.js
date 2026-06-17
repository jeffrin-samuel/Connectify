import mongoose, { Schema } from "mongoose";

// Defines structure for storing meeting activity per user
const meetingSchema = new Schema({
    user_id: { type: String },
    meetingCode: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true }
});

const Meeting = mongoose.model("Meeting", meetingSchema); // Creates Meeting collection in MongoDB

export default Meeting;