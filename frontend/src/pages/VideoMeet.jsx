import { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { TextField } from '@mui/material';
import { Button } from '@mui/material';
import "../styles/VideoMeet.css";

const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

// All active WebRTC peer connections, keyed by the other user's socket id.
// Lives outside component so it survives re-renders without triggering them.
let connections = {};

// STUN/TURN setup — full explanation in notes.md (#15 STUN Server & TURN Server)
// Fetches a fresh iceServers array (STUN + TURN) from our own backend.
// Backend calls Turnix with a secret bearer token — credentials never exposed to browser.
async function getIceServers() {
  const stun = { urls: "stun:stun.l.google.com:19302" };

  try {
    const response = await fetch(`${SERVER_URL}/api/turn/credentials`);
    const iceServers = await response.json();
    return [stun, ...iceServers]; // Google STUN + Turnix STUN + Turnix TURN
  } catch (err) {
    console.error("Couldn't fetch TURN credentials, falling back to STUN only:", err);
    return [stun];
  }
}

// Cache so we only hit the backend once per page session, not once per peer.
// Every new RTCPeerConnection reuses these — fresh ICE gathering (host/srflx/relay)
// still happens independently per connection, just with the same server list.
let cachedIceServers = null;

async function ensureIceServers() {

  if (!cachedIceServers) {
    cachedIceServers = await getIceServers();
  }
  return cachedIceServers;
}

// Usage when creating a peer connection (implemented later):
// const iceServers = await ensureIceServers();
// const peerConnection = new RTCPeerConnection({ iceServers });


// TEMPORARY testing block — forces TURN-only to verify relay works. Remove after testing.
// const peerConnection = new RTCPeerConnection({ iceServers, iceTransportPolicy: "relay" });


export default function VideoMeet() {

  // ---------- Refs (don't trigger re-renders) ----------

  const socketRef = useRef();      // our socket.io-client connection
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
  const [screen, setScreen] = useState();

  // ---------- Chat ----------

  const [messages, setMessages] = useState([]);      // full message history
  const [message, setMessage] = useState("");        // current draft
  const [newMessages, setNewMessages] = useState(0); // unread count (badge)

  // ---------- Lobby / join flow ----------

  const [askForUsername, setAskForUsername] = useState(true); // show lobby screen first
  const [username, setUsername] = useState("");
  const [showModal, setShowModal] = useState(false);           // chat panel toggle

  // ---------- Remote participants currently in the call ----------
  const [videos, setVideos] = useState([]);

  /* TODO: detect non-Chrome browsers — some WebRTC/getDisplayMedia behaviour
     differs (or is unsupported) outside Chromium-based browsers.                      */

  //  ---------------- Permissions -----------------------------

  const getPermissions = async () => {
    try {
      // Use local variables — state setters (setVideoAvailable etc.) are async
      // and won't update the state values in time for the stream request below
      let isVideoAvailable = false;
      let isAudioAvailable = false;

      // Each permission request in its own try/catch so one denial doesn't
      // block the other (e.g. no camera shouldn't prevent audio from working)
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        isVideoAvailable = true;
        console.log("Video permission granted");
      } catch {
        isVideoAvailable = false;
        console.log("Video permission denied");
      }

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        isAudioAvailable = true;
        console.log("Audio permission granted");
      } catch {
        isAudioAvailable = false;
        console.log("Audio permission denied");
      }

      setVideoAvailable(isVideoAvailable);
      setAudioAvailable(isAudioAvailable);

      // getDisplayMedia is a function reference — check it exists, not the result of calling it
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      if (isVideoAvailable || isAudioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: isVideoAvailable,
          audio: isAudioAvailable,
        });

        window.localStream = userMediaStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
        }
      }

    } catch (err) {
      console.error("Error getting permissions:", err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []); // empty array = run once on mount only
          

  // ---------------- Media controls ------------------------------------------

  // Runs whenever video or audio toggle state changes — requests new stream
  // or stops all tracks if both are off
  let getUserMediaSuccess = (stream) => {
    // TODO: implement — stop old tracks, assign new stream to localVideoRef,
    // re-add stream to all existing peer connections and re-send offers
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {

    // Request whatever combination is currently toggled on:
    // { video: true,  audio: true  } → full stream
    // { video: false, audio: true  } → audio-only (video was turned off)
    // { video: true,  audio: false } → video-only (audio was turned off)
    // getUserMediaSuccess handles stopping old tracks + applying the new stream

      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then((stream) => getUserMediaSuccess(stream)) 
        .catch((e) => console.error("getUserMedia error:", e));
    
    } else {
      // Both off — nothing to request, stop all tracks to release camera/mic hardware
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (err) {
        console.error("Error stopping tracks:", err);
      }
    }
  };


  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  // Called when user clicks Connect in the lobby.
  // Sets initial media state (triggers getUserMedia via useEffect above to read updated states)
  // and will then connect to socket server once that's implemented.
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    // connectToSocketServer() — coming next
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  // --------------------------------------  Socket / WebRTC (TODO) --------------------------------------  
  // connectToSocketServer, gotMessageFromServer, getUserMediaSuccess full
  // implementation, user-joined / user-left handlers, ICE candidate exchange,
  // offer/answer flow — all coming next
  //
  // Socket connection pattern (io from socket.io-client, NOT socketManager.js):
  // socketRef.current = io(SERVER_URL);
  // socketRef.current.on("connect", () => {
  //   socketIdRef.current = socketRef.current.id;
  //   socketRef.current.emit("join-call", window.location.href);
  // });

  // ------------------------------- Chat (TODO) -------------------------------------- 
  // addMessage, sendMessage, handleMessage — coming next

  // -------------------  Screen share (TODO) --------------------------------------------------- 
  // getDisplayMedia, getDisplayMediaSuccess — coming next

  // ------------------- UI handlers ------------------------------------------------------
  let handleVideo = () => setVideo(!video);
  let handleAudio = () => setAudio(!audio);

  // --------------------- Render ------------------------------------------------------

  return (
    <div>
      {askForUsername === true ? (

        <div>
          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoRef} autoPlay muted />
          </div>
        </div>

      ) : (

        <div>
          {/* TODO: full meeting UI — video grid, controls bar, chat panel */}
        </div>

      )}
    </div>
  );
}