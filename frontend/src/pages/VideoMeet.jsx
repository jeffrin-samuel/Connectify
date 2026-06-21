import { useEffect, useRef, useState } from 'react';
import "../styles/VideoMeet.css";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';


const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

let connections = {};

// STUN/TURN setup — full explanation in notes.md (#15 STUN Server)
// Fetches a fresh iceServers array (STUN + TURN) from the backend
async function getIceServers() {
  const stun = { urls: "stun:stun.l.google.com:19302" };

  try {
    const response = await fetch(`${SERVER_URL}/api/turn/credentials`);
    const iceServers = await response.json(); // already ready-to-use, straight from Turnix
    return [stun, ...iceServers];
  } catch (err) {
    console.error("Couldn't fetch TURN credentials, falling back to STUN only:", err);
    return [stun];
  }
}

// Cache so we only fetch once per call session, not once per peer
let cachedIceServers = null;
async function ensureIceServers() {
  if (!cachedIceServers) {
    cachedIceServers = await getIceServers();
  }
  return cachedIceServers;
}

// const iceServers = await ensureIceServers();
// const peerConnection = new RTCPeerConnection({ iceServers });


/* // TEMPORARY — forces TURN-only, remove after testing

  const peerConnection = new RTCPeerConnection({
  iceServers,
  iceTransportPolicy: "relay",
  });    
  
*/



export default function VideoMeet() {

    // ---------- Refs (don't trigger re-renders) ----------

  const socketRef = useRef();      // our socket.io connection
  const socketIdRef = useRef();    // our own socket id once connected
  const localVideoRef = useRef();  // <video> element showing our own stream
  const videoRef = useRef([]);     // <video> elements for each remote participant
 
  // ---------- Permissions: what the browser actually granted ----------

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);
 
  // ---------- Media state: what the user has toggled on/off ----------

  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);
  const [screen, setScreen] = useState(false);
 
  // ---------- Chat ----------

  const [messages, setMessages] = useState([]);       // full message history
  const [message, setMessage] = useState("");         // current draft
  const [newMessages, setNewMessages] = useState(0);   // unread count (badge)
 
  // ---------- Lobby / join flow ----------

  const [askForUsername, setAskForUsername] = useState(true); // show "enter name" screen first
  const [username, setUsername] = useState("");
  const [showModal, setShowModal] = useState(false);          // generic popup/notification
 
  // ---------- Remote participants currently in the call ----------
  const [videos, setVideos] = useState([]);

    // TODO
    // if(isChrome() === false){

    // }

    const getPermissions = async () => {
        try{
            const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});

            if(videoPermission){
                setVideoAvailable(true);
            }
            else {
                setVideoAvailable(false);
            }

             const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});

            if(audioPermission){
                setAudioAvailable(true);
            }
            else {
                setAudioAvailable(false);
            }

            const screenSharing = navigator.mediaDevices.getDisplayMedia;

            if(screenSharing){
                setScreenAvailable(true);
            }
            else{
                setScreenAvailable(false);
            }

        } catch (err){
            console.error("Error: ", err);
        }
    }

    useEffect(() => {

       getPermissions();

    }, [])


  return (
    <div>

        {askForUsername === true ?
            <div>

                <h2>Enter into Lobby</h2>
                <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                <Button variant="contained">Connect</Button>

                <div>
                    <video ref={localVideoRef} autoPlay muted />
                </div>

            </div> : <></>
        }


    </div>
  )
}

