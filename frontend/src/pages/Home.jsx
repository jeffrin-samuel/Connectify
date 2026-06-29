import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import withAuth from '../utils/withAuth';
import DuoIcon from '@mui/icons-material/Duo';
import "../App.css"
import { Button, TextField }  from "@mui/material";
import RestoreIcon from '@mui/icons-material/Restore';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useContext } from "react";
import { MeetingContext } from "../contexts/MeetingContext";

// Dark theme matching Connectify's black & purple aesthetic
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#7c5cbf' },
        secondary: { main: '#9c7de0' },
        background: { paper: '#141422', default: '#141422' },
        text: { primary: '#e8e8f0', secondary: '#9999bb' },
    },
});


function Home() {
  
  let navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(MeetingContext);

  let handleJoinVideoCall = async () => {

    try {
      await addToUserHistory(meetingCode);
    } catch(err) {
      console.error("Failed to save meeting history:", err);
      // history save failing shouldn't block joining the meeting
    }
    
    navigate(`/${meetingCode}`); // always navigate, regardless of history save result
  }
  
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
    
      <>
   
        <div className="navBar" style={{ height: "60px", display: "flex", justifyContent: "space-between", paddingInline: "15px", backgroundColor: "#303061", borderBottom: "1px solid #1e1e2e" }}>
          
          {/* Navbar brand — Connectify logo + text   */}
          <div className="navItem">
            <DuoIcon style={{ fontSize: "40px", color: "#9c7de0" }} />
            <h2 style={{ color: "#e8e8f0", marginLeft: "8px" }}>Connectify</h2>
          </div>
          
          {/* Navbar right section — History and Logout */}
          <div style={{ display: "flex", alignItems: "center", marginRight: "2rem", gap: "20px" }}>
            
            {/* History button */}
            <div onClick={() => navigate("/history")} className="navItem" style={{color: "#e8e8f0", gap: "4px" }}>
              <RestoreIcon style={{ color: "#9c7de0" }} />
              <p style={{ fontWeight: "bold", fontSize: "large", margin: 0 }}>History</p>
            </div>
            
            {/* Logout button */}
            <Button variant="contained"
              onClick={() => { localStorage.removeItem("token"); navigate("/auth"); }}
              style={{ color: "#e8e8f0"}}
            >
              Logout
            </Button>
          </div>

        </div>
      

        <div className="meetContainer">

          <div className="leftPanel">
            <div>
              <h1>
                Connect face to face,{' '}
                <span style={{ color: "#9d81d9" }}>from anywhere</span>
              </h1>

              <div style={{display: "flex", gap: "10px", marginTop: "7px"}}>

                <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                <Button onClick={ handleJoinVideoCall } variant='contained'> Join </Button>

              </div>
            </div>
          </div>

          <div className='rightPanel'>
            <img srcSet='/video-call-2.png' alt="" />
          </div>

        </div>
      </>
    </ThemeProvider>
  )
}

export default withAuth(Home);