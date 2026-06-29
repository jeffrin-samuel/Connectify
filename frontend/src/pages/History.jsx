import { useContext, useEffect, useState } from "react"
import { MeetingContext } from "../contexts/MeetingContext"
import { useNavigate } from "react-router-dom";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { Snackbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import withAuth from "../utils/withAuth";
import "../styles/MeetHistory.css"

// Dark theme matching Connectify's black & purple aesthetic
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#7c5cbf' },
        secondary: { main: '#9c7de0' },
        background: { paper: '#1e1e2e', default: '#141422' },
        text: { primary: '#e8e8f0', secondary: '#9999bb' },
    },
});

function History() {

    const { getUserHistory } = useContext(MeetingContext);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState(false);
    const [meetings, setMeetings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserHistory = async () => {
            try {
                const meetingsHistory = await getUserHistory();
                setMeetings(meetingsHistory);
            } catch (err) {
                console.error("Error fetching User Meeting History", err);
                let errMsg = err.response?.data?.message || "Meeting History could not be fetched";
                setError(errMsg);
                setNotification(true);
            }
        }
        fetchUserHistory();
    }, []);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />

            <div className="historyContainer">

                {/* Navbar */}
                <div className="historyNavBar">
                    <Button
                        onClick={() => navigate("/home")}
                        startIcon={<HomeIcon />}
                        style={{ color: "#9c7de0" }}
                    >
                        Back to Home
                    </Button>  

                    <span style={{ color: "#535379", fontSize: "1.5rem" }}> | </span>

                    <h2>Meeting History</h2>
                </div>

                {/* Content */}
                <div className="historyContent">

                    {meetings.length !== 0 ? (

                        [...meetings].reverse().map((meeting, index) => (
                            
                            <Card key={index} className="meetingCard">
                                <CardContent>
                                    <Typography sx={{ fontSize: 14, color: '#9999bb', mb: 0.5 }}>
                                        Meeting Code
                                    </Typography>
                                    <Typography sx={{ fontSize: 18, color: '#e8e8f0', fontWeight: 600, mb: 1 }}>
                                        {meeting.meetingCode}
                                    </Typography>
                                    <Typography sx={{ fontSize: 13, color: '#9999bb' }}>
                                        {formatDate(meeting.date)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="noMeetings">No meeting history yet.</p>
                    )}

                </div>

            </div>

            {/* MUI Snackbar — brief popup notification shown at bottom of screen */}
            <Snackbar
                open={notification}   // visible when notification state is true
                autoHideDuration={4000}  // auto dismisses after 4 seconds
                onClose={() => setNotification(false)}  // resets notification state to false on dismiss
                message={error}  // display error message 
            />

        </ThemeProvider>
    );
}

export default withAuth(History);