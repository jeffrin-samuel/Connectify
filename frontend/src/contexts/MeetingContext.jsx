import { createContext } from "react";
import apiClient from "../utils/apiClient";

export const MeetingContext = createContext({});

export const MeetingProvider = ({ children }) => {

  const getUserHistory = async () => {
    try {
      const response = await apiClient.get("/activities");
      return response.data;
    } catch(err) {
      console.error("Failed to fetch history:", err);
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      await apiClient.post("/activities", { meeting_code: meetingCode });
    } catch(err) {
      console.error("Failed to save meeting:", err);
      throw err;
    }
  };

  const data = { getUserHistory, addToUserHistory };

  return (
    <MeetingContext.Provider value={data}>
      {children}
    </MeetingContext.Provider>
  );
};
