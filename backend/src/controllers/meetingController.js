// backend/src/controllers/meetingControllers.js
import Meeting from "../models/meetingModel.js";
import axios from "axios";
import httpStatus from "http-status";

// Saves chat messages for a meeting — called when call ends
const saveChatMessages = async (req, res) => {
    const { meetingId } = req.params;
    const { messages } = req.body;
    
    try {
        const meeting = await Meeting.findByIdAndUpdate(
             meetingId,    //matches by meetingId (guaranteed unique)
            { chatMessages: messages },
            { returnDocument: 'after' } // returns the document AFTER update

        );

        if(!meeting){
            return res.status(httpStatus.NOT_FOUND).json({ message: "Meeting not found" });
        }

        res.status(httpStatus.OK).json({ message: "Chat saved" });

    } catch(err) {
        console.error("Error saving chat messages:", err);
        res.status(500).json({ message: "Failed to save chat" });
    }
}

// Generates AI summary + action items from saved chat messages
const generateSummary = async (req, res) => {

    const { meetingId } = req.params;  //Extracting the meetingId from the API's Endpoint URL

    try {

         const meeting = await Meeting.findById(meetingId);

        if(!meeting){
            return res.status(httpStatus.NOT_FOUND).json({ message: "Meeting not found" });
        }

        // return cached summary if already generated — avoids unnecessary Gemini calls
        if(meeting.summary){
            return res.status(httpStatus.OK).json({
                summary: meeting.summary,
                actionItems: meeting.actionItems
            });
        }

        if(!meeting.chatMessages || meeting.chatMessages.length === 0){
            return res.status(httpStatus.NOT_FOUND).json({ message: "No chat messages found for this meeting" });
        }

        // format chat into plain text for Gemini
        const chatTranscript = meeting.chatMessages
            .map(msg => `${msg.sender}: ${msg.data}`)
            .join("\n");

        const prompt = `
            You are analyzing a chat transcript from a video meeting. Generate:

            1. A concise summary (3-4 sentences) covering what was discussed
            2. Action items — extract any tasks, responsibilities, or commitments mentioned by participants, along with who said it (if identifiable from the chat)

            Important: 
            - If someone mentions a task without explicit "I will do X" phrasing, still infer it if the intent is clear (e.g. "Sarah: HTML, CSS Project" implies Sarah is handling the HTML/CSS work)
            - If no meaningful action items exist, write "No specific action items identified"
            - Keep action items concise — one line each

            Chat transcript:
            ${chatTranscript}

            Respond in this exact format:
            SUMMARY: <summary text>
            ACTION ITEMS:
            - <item 1>
            - <item 2>
            `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            },
            {
                headers: {
                    "x-goog-api-key": process.env.GEMINI_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        const aiText = response.data.candidates[0].content.parts[0].text;

        // parse Gemini's response into summary and action items
        const [summaryPart, actionPart] = aiText.split("ACTION ITEMS:");
        const summary = summaryPart.replace("SUMMARY:", "").trim();
        const actionItems = actionPart ? actionPart.trim() : "";

        // cache result in DB so we don't call API again for the same meeting
        meeting.summary = summary;
        meeting.actionItems = actionItems;
        
        await meeting.save();

        res.status(httpStatus.OK).json({ summary, actionItems });

    } catch(err) {
        console.error("Gemini summary error:", err);
        
        if(err.response?.status === 503){
            return res.status(503).json({ message: "Service unavailable. Please try again later"});
        }
        
        res.status(500).json({ message: "Failed to generate summary" });
    }
}

export { saveChatMessages, generateSummary };