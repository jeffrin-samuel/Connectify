import { createContext } from "react";
import apiClient from "../utils/apiClient";

export const MeetingContext = createContext({});

export const MeetingProvider = ({ children }) => {

  const getUserHistory = async () => {
    try {
      const response = await apiClient.get("/users/activities");
      return response.data;
    } catch(err) {
      console.error("Failed to fetch history:", err);
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      const response = await apiClient.post("/users/activities", { meeting_code: meetingCode });
      return response.data;  // { message, meetingId }
    } catch(err) {
      console.error("Failed to save meeting: ", err);
      throw err;
    }
  };

  const saveChatMessages = async (meetingId, messages) => {
    try {
        await apiClient.post(`/meetings/${meetingId}/save-chat`, { messages });
    } catch(err) {
        console.error("Failed to save chat messages:", err);
        throw err;
    }
};

const generateSummary = async (meetingId) => {
    try {
        const response = await apiClient.get(`/meetings/${meetingId}/summary`);
        return response.data;  // { summary, actionItems }
    } catch(err) {
        console.error("Failed to generate summary:", err);
        throw err;
    }
};

  const data = { getUserHistory, addToUserHistory, saveChatMessages, generateSummary };

  return (
    <MeetingContext.Provider value={data}>
      {children}
    </MeetingContext.Provider>
  );
};
