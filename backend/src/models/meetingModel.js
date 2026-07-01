import mongoose, { Schema } from "mongoose";

// Defines structure for storing meeting activity per user
const meetingSchema = new Schema({
    user_id: { type: String },
    meetingCode: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true },

    // chat messages for this meeting — used for AI summary generation
    chatMessages: [{
        sender: String,
        data: String,
        timestamp: { type: Date, default: Date.now }
    }],

    summary: { type: String, default: "" },       // AI generated summary
    actionItems: { type: String, default: "" }    // AI generated action items
});

const Meeting = mongoose.model("Meeting", meetingSchema); // Creates Meeting collection in MongoDB

export default Meeting;