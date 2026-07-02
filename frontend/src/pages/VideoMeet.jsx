import { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import "../styles/VideoMeet.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Typography from '@mui/material/Typography';
import { useContext } from "react";
import { MeetingContext } from "../contexts/MeetingContext";
import CloseIcon from '@mui/icons-material/Close';

const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

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
    const data = await response.json();

    // if backend returned an error object instead of array, just use STUN
    if (!response.ok || !Array.isArray(data)) {
      console.warn("TURN credentials unavailable, falling back to STUN only");
      return [stun];
    }

    const iceServers = data;
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


// TEMPORARY testing block — forces TURN-only to verify relay works. Remove after testing.


// Adds tracks to a peer connection safely.
// Uses replaceTrack if sender exists (camera/mic toggle case)
// Uses addTrack if no sender exists yet (new connection case)
// Returns Promise so caller can await all replacements before createOffer
async function updateTracksOnConnection(connection, stream) {
  const senders = connection.getSenders();

  const promises = stream.getTracks().map(track => {
    // find sender matching this track kind — check both active and nulled senders
    const sender = senders.find(s => {
      if(s.track) return s.track.kind === track.kind; // active sender
      // for nulled senders, we can't know the kind — try replaceTrack on all nulled ones
      return false;
    });

    if(sender){
      console.log(`[REPLACE] Replacing ${track.kind} track`);
      return sender.replaceTrack(track);
    } else {
      // no active sender found — check if there's a nulled sender to reuse
      const nulledSender = senders.find(s => s.track === null);
      if(nulledSender){
        console.log(`[RESTORE] Restoring nulled sender with ${track.kind} track`);
        return nulledSender.replaceTrack(track);
      }
      console.log(`[ADD] Adding new ${track.kind} track`);
      connection.addTrack(track, stream);
      return Promise.resolve();
    }
  });

  senders.forEach(sender => {
    if(!sender.track) return;
    const stillNeeded = stream.getTracks().some(t => t.kind === sender.track.kind);
    if(!stillNeeded){
      console.log(`[SILENCE] Nulling ${sender.track.kind} sender — not in new stream`);
      promises.push(sender.replaceTrack(null));
    }
  });

  return Promise.all(promises);
}


export default function VideoMeet() {

  let routeTo = useNavigate();   //For routing

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
  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  // ---------- Chat ----------

  const [messages, setMessages] = useState([]);      // full message history
  const [message, setMessage] = useState("");        // current draft
  const [newMessages, setNewMessages] = useState(0); // unread count (badge)

  // ---------- Lobby / join flow ----------

  const [askForUsername, setAskForUsername] = useState(true); // show lobby screen first
  const [username, setUsername] = useState("");
  const [showModal, setShowModal] = useState(false);           // chat panel toggle
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ---------- Remote participants currently in the call ----------
  const [videos, setVideos] = useState([]);

  // ------------ Meeting Id ---------------------------------------
  const [meetingId, setMeetingId] = useState(null);

  /* TODO: detect non-Chrome browsers — some WebRTC/getDisplayMedia behaviour
     differs (or is unsupported) outside Chromium-based browsers.                      */

  // -------------- Lobby AI summary-info for logged in users -------------------

    useEffect(() => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    }, []); // runs after mount — token guaranteed to be in localStorage by then

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
  let getUserMediaSuccess = async(stream) => {

    // stop all old tracks first
    try{
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Error stopping old tracks: ", err);
    }

    window.localStream = stream;
    
    //update local preview
    if (stream.getVideoTracks().length === 0) {
      const blackTrack = blackScreen(); // returns a video track, not a canvas
      const blackStream = new MediaStream([blackTrack]);
      localVideoRef.current.srcObject = blackStream; // show black locally
    } else {
      localVideoRef.current.srcObject = stream; // show real video locally
    }
    
    // update all peer connections — await replaceTrack before creating offer
    for(let id in connections){
      if(id === socketIdRef.current) continue;

      await updateTracksOnConnection(connections[id], window.localStream);



      window.localStream.getTracks().forEach(track => {
        try {
          connections[id].addTrack(track, window.localStream);
        } catch(err) {
          console.error("addTrack skipped — sender already exists for this track kind:", err.name);
        }
      });

      connections[id].createOffer({ iceRestart: true }).then((description) => {

        console.log(`[OFFER] Created for ${id}:`, description); //logs full SDP offer object

        connections[id].setLocalDescription(description)
        .then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}));
        })
        .catch(e => console.error(e));
      })
    }

    stream.getTracks().forEach(track => track.onended = async () => {
      setVideo(false);
      setAudio(false);

      try{
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (err){
        console.error("Error in stopping tracks", err);
      }


      let blackSilence = (...args) => new MediaStream([blackScreen(...args), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      for(let id in connections){

        // await replaceTrack before createOffer
        await updateTracksOnConnection(connections[id], window.localStream);

        connections[id].createOffer({ iceRestart: true }).then((description)=>{
          
          console.log(`[OFFER] Re-offer (track ended) for ${id}:`, description); //logs full SDP offer object
          
          connections[id].setLocalDescription(description)
          .then(()=>{
            socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}));
          }).catch((err) => {
            console.error("Error in creating offers: ", err);
          })
        })
      }
    })

  };


  let silence = () => {

    let audioContext = new AudioContext();
    let oscillator = audioContext.createOscillator();
    
    let dest = oscillator.connect(audioContext.createMediaStreamDestination());

    oscillator.start();
    audioContext.resume();
    return Object.assign(dest.stream.getAudioTracks()[0], {enabled: false});
  }

    let blackScreen = ({ width = 640, height = 480 } = {}) => {

      let canvas = Object.assign(document.createElement("canvas"), { width, height });
      canvas.getContext('2d').fillRect(0, 0, width, height);

      let stream = canvas.captureStream();
      return Object.assign(stream.getVideoTracks()[0], { enabled: false });

    }

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

      if (video === false && audio === false && !window.localStream) return; // nothing to stop yet
      
      // only call getUserMedia on initial setup, not on subsequent toggles
      if (window.localStream) {
        // tracks already managed via track.enabled in handlers
        return;
      }

      getUserMedia();
    }
  }, [audio, video]);

  useEffect(() => {

  if (!askForUsername && window.localStream && localVideoRef.current) {
    localVideoRef.current.srcObject = window.localStream;
  }

}, [askForUsername]);


  let gotMessageFromServer = (fromId, message) => {  
 
    let signal = JSON.parse(message);

    if(fromId !== socketIdRef.current){

      if(signal.sdp){
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() =>{

          if(signal.sdp.type === "offer"){

            connections[fromId].createAnswer().then((description) => {

              console.log(`[ANSWER] Created for ${fromId}:`, description); // logs full SDP answer object

              connections[fromId].setLocalDescription(description).then(()=>{
                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));

              }).catch(err => console.error("Error", err));
            }).catch(e => console.error("Error", e));
          }
        }).catch(err => console.error("Error", err));
      }

      if(signal.ice){
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.error("Error", e));
      }

    }
  }

  let connectToSocketServer = async () => {

    const iceServers = await ensureIceServers(); // fetch once before socket connects

    socketRef.current = io.connect(SERVER_URL, {secure: false});

    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on("connect", () => {
      
      // assign socket id before emitting join-call — user-joined fires back almost instantly,
      // and the self-skip guard (socketListId === socketIdRef.current) depends on this being set
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", window.location.href, username);

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      })

      socketRef.current.on("user-joined", (userJoinedId, clients, usernameMap) => {

        console.log("[USER-JOINED] userJoinedId:", userJoinedId);
        console.log("[USER-JOINED] clients:", clients);

        clients.forEach((socketListId) => {

          if (socketListId === socketIdRef.current) return; // skip self — no peer connection needed with yourself

          // TESTING ONLY — forces all traffic through TURN relay, bypassing direct connections
          // Uncomment to verify TURN server is working, remove before production
          // const peerConnection = new RTCPeerConnection({ iceServers, iceTransportPolicy: "relay" });

          const peerConnection = new RTCPeerConnection({ iceServers }); 

          connections[socketListId] = peerConnection;

          // ----------- ICE connection monitor ---------------------------------------------------
          connections[socketListId].oniceconnectionstatechange = () => {

            console.log(`[ICE STATE] ${socketListId}: ${connections[socketListId].iceConnectionState}`);

            if (connections[socketListId].iceConnectionState === "connected") {
              connections[socketListId].getStats().then(stats => {

                const candidates = {};
                stats.forEach(report => {
                  if (report.type === "local-candidate" || report.type === "remote-candidate") {
                    candidates[report.id] = report;
                  }
                });

                stats.forEach(report => {
                if (report.type === "candidate-pair" && report.nominated && report.state === "succeeded") {
                  const local = candidates[report.localCandidateId];
                  const remote = candidates[report.remoteCandidateId];
                  console.log(`[ICE] Connected to ${socketListId}`);
                  console.log(`[ICE] Local:  ${local?.candidateType}`);
                  console.log(`[ICE] Remote: ${remote?.candidateType}`);
                }
                });

              });
            }
          };
          // --------------------------------------------------------------------

          connections[socketListId].onicecandidate = (event) => {
            if(event.candidate !== null){
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
          }

          connections[socketListId].ontrack = (event) => {

            const stream = event.streams[0];
            if (!stream) return;

            // check videoRef (not videos state) since state updates are async
            // and we need the CURRENT value right now
            let videoExists = videoRef.current.find(video => video.socketId === socketListId);

            if(videoExists){

              // update existing tile's stream
              setVideos(videos => {
                const updatedVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: stream } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });

            } else {

              const alreadyExists = videoRef.current.find(v => v.socketId === socketListId);
              if(alreadyExists) return;

              // only create tile if one doesn't already exist for this socketId
              let newVideo = {
                socketId: socketListId,
                stream: stream,
                username: usernameMap[socketListId] || "Guest", // correct username per socket
                autoPlay: true,
                playsinline: true
              };
              
              setVideos(videos => {
                // double-check inside setter too — state batching can cause race conditions
                const alreadyExists = videos.find(v => v.socketId === socketListId);
                if (alreadyExists) return videos; // don't add duplicate
                
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if(window.localStream !== undefined && window.localStream !== null){

            window.localStream.getTracks().forEach(track => {
              connections[socketListId].addTrack(track, window.localStream);
            });

          } else {

            let blackSilence = (...args) => new MediaStream([blackScreen(...args), silence()]);
            window.localStream = blackSilence();
            window.localStream.getTracks().forEach(track => {
              connections[socketListId].addTrack(track, window.localStream);
            });

          }

        })

        if(userJoinedId === socketIdRef.current){
          for (let id in connections){
            if(id === socketIdRef.current) continue;

            window.localStream.getTracks().forEach(track => {
              try {
                connections[id].addTrack(track, window.localStream);
              } catch(err) {
                console.error("Error adding stream: ", err);
              }
            });

            connections[id].createOffer({ iceRestart: true }).then((description) => {

              console.log(`[OFFER] Created for ${id}:`, description); //logs full SDP offer object

              connections[id].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
              })
              .catch(err => console.error("Error in creating offer: ", err));
            });
          }
        }
      })
    })
  }


  // Called when user clicks Connect in the lobby.
  // Sets initial media state (triggers getUserMedia via useEffect above to read updated states)
  // and will then connect to socket server once that's implemented.
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };


useEffect(() => {
  const token = localStorage.getItem("token");
  if(token){
    try {
      const decoded = JSON.parse(atob(token.split(".")[1])); // decode JWT payload
      setUsername(decoded.username); // pre-fill with real username
    } catch(err) {
      // token malformed/invalid — leave empty, user types manually
      // real validation happens on backend via authenticate middleware
    }
  }
}, []);


  const { url: meetingCode } = useParams();

  const { saveChatMessages, addToUserHistory } = useContext(MeetingContext);


  let connect = async () => {

    if(!username) return;

    const token = localStorage.getItem("token");

    if(token){
        try {
            const response = await addToUserHistory(meetingCode);
            setMeetingId(response?.meetingId || null); // store the specific _id
        } catch(err) {
            console.error("Failed to save meeting history:", err);
            // no err throw since it will block joining if history save fails
        }
    }

    setAskForUsername(false);
    getMedia();
  };

  // ------------------- UI handlers ------------------------------------------------------
  
  let handleVideo = () => {

    // toggle enabled on the actual track directly
    if(window.localStream){
      window.localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }

    setVideo(!video);
  };

  let handleAudio = async () => {
    const newAudioState = !audio;
    setAudio(newAudioState);

    if(window.localStream){
      const audioTracks = window.localStream.getAudioTracks();

      if(audioTracks.length > 0){
        // normal case — stream has audio track, just toggle it
        audioTracks.forEach(track => {
          track.enabled = newAudioState;
        });
      } else if(newAudioState && screen){
        // during screen share with no audio track — fetch mic and add it
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const micTrack = micStream.getAudioTracks()[0];

          // add to combined stream
          window.localStream.addTrack(micTrack);

          // update all peer connections
          for(let id in connections){
            if(id === socketIdRef.current) continue;
            await updateTracksOnConnection(connections[id], window.localStream);
            connections[id].createOffer({ iceRestart: true }).then(description => {
              connections[id].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", id, JSON.stringify({
                  "sdp": connections[id].localDescription
                }));
              }).catch(e => console.error(e));
            });
          }
        } catch(err) {
          console.error("Could not get mic during screen share:", err);
        }
      }
    }
  };

//----------------- Screen-Sharing --------------------------------------------------------
  let getDisplayMediaSuccess = async (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Error stopping tracks for screen-sharing:", err);
    }

    // get mic audio separately to combine with screen video
    let audioStream = null;
    try {
      if(audio) {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (err) {
      console.error("Could not get mic audio for screen share:", err);
    }

    // combine screen video + mic audio into one stream
    const combinedStream = new MediaStream([
      stream.getVideoTracks()[0],
      ...(audioStream ? audioStream.getAudioTracks() : [])
    ]);

    window.localStream = combinedStream;
    localVideoRef.current.srcObject = combinedStream;

    // send combined stream to all peers
    for(let id in connections){
      if(id === socketIdRef.current) continue;
      await updateTracksOnConnection(connections[id], window.localStream);
      connections[id].createOffer({ iceRestart: true }).then(description => {
        connections[id].setLocalDescription(description)
        .then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({
            "sdp": connections[id].localDescription
          }));
        })
        .catch(e => console.error("Error setting description:", e));
      });
    }

    // use a flag to prevent onended firing twice
    let screenEndHandled = false;

    stream.getVideoTracks()[0].onended = async () => {
      if(screenEndHandled) return; // prevent double trigger
      screenEndHandled = true;
      
      console.log("[SCREEN END] video:", video, "audio:", audio);

      setScreen(false);

      // stop all combined stream tracks
      try {
        combinedStream.getTracks().forEach(t => t.stop());
      } catch (err) {
        console.error("Error stopping combined stream tracks:", err);
      }

      // restore camera/mic based on user's current toggle state
      try {
        const restoredStream = await navigator.mediaDevices.getUserMedia({
          video: video,
          audio: audio
        });
        console.log("[SCREEN END] restored tracks:", restoredStream.getTracks().map(t => t.kind));
        
        await getUserMediaSuccess(restoredStream);
      } catch(err) {
        // permissions unavailable — show black silence
        let blackSilence = (...args) => new MediaStream([blackScreen(...args), silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;

        // send black silence to peers
        for(let id in connections){
          if(id === socketIdRef.current) continue;
          await updateTracksOnConnection(connections[id], window.localStream);
          connections[id].createOffer({ iceRestart: true }).then(description => {
            connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({
                "sdp": connections[id].localDescription
              }));
            }).catch(e => console.error(e));
          });
        }
      }
    };
  };

  let getDisplayMedia = () => {
    if(screen){
      if(navigator.mediaDevices.getDisplayMedia){
        navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
        .then((stream) => getDisplayMediaSuccess(stream))
        .catch((err) => console.error("Error in displaying screen: ", err));
      }
    }
  }

  let handleScreen = () => {
    if(screen) {
      // turning OFF — stop tracks immediately
      try {
        window.localStream.getTracks().forEach(track => track.stop());
      } catch(err) {
        console.error("Error stopping screen share:", err);
      }
    }
    setScreen(!screen);
  }

  useEffect(() => {
    if(screen !== undefined){
      getDisplayMedia();
    }
  }, [screen]);

  // --------------------- Real-Time Messages ------------------------------------------------------

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  }

    let addMessage = (data, sender, socketIdSender) => {   

    setMessages((prevMessages) => [
      ...prevMessages, 
      {sender: sender, data: data}
    ]);

    if(socketIdSender !== socketIdRef.current){
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  }
  
  //Set Unread Messages to 0 once chat panel is toggled (opened or closed)
  useEffect(() => {
    setNewMessages(0);
  }, [showModal])

  // --------------------- Call-end ------------------------------------------------------

  let handleEndCall = async () => {

    // Save chat messages to DB before ending the call
    try {
      await saveChatMessages(meetingId, messages);
    } catch(err) {
      console.error("Error saving chat history: ", err);
      // no err throw — chat save failing shouldn't block ending the call
    }

    // stop screen share if active before ending call
    if(screen){
      try {
        window.localStream.getTracks().forEach(track => track.stop());
      } catch(err) {
        console.error("Error stopping screen share on end call:", err);
      }
    }
    
    try{
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (err) {
      console.error("Error stopping tracks after call-end ", err);
    }

    // close all peer connections cleanly
    Object.keys(connections).forEach(id => {
      connections[id].close();
      delete connections[id];
    });

    const token = localStorage.getItem("token");
    
    //Hard Refresh
    if(token){
      window.location.href = "/home";  // logged in user → home
    } else {
      window.location.href = "/"   // guest user → landing page
    }

  }

  // --------------------- Info Button (Meeting Link) -------------------------------------

  useEffect(() => {
  if (showInfo) {
    const timer = setTimeout(() => {
      setShowInfo(false);
    }, 5000);
    return () => clearTimeout(timer);  // cleanup if user closes it manually before 5s
  }
}, [showInfo]);


const handleCopy = () => {
  navigator.clipboard.writeText(window.location.href);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}



  // --------------------- Render ------------------------------------------------------

  return (

    <div style={{ margin: 0, padding: 0, height: "100vh", width: "100vw", overflow: "hidden" }}>
      {askForUsername === true ? (
      
      //Theme Stylings Applied to Meeting Lobby Only   
      <ThemeProvider theme={darkTheme}>
      <CssBaseline />

        <div className='lobbyContainer'>
          
          <h2>Welcome to the Lobby</h2>

          {/* Permission reminder — always visible so user grants access before joining */}
          <Typography className='accessInfo'
            variant="body2" 
            sx={{ color: '#9999bb', textAlign: 'center', fontSize: '0.85rem', mb: 0.5  }}
          >
            ⚠️ Please allow camera and microphone access before joining
          </Typography>

          {/* AI summary hint — only shown to logged in users */}
          {isLoggedIn && (
              <Typography className='aiInfo' variant="body2" sx={{ color: '#9999bb', textAlign: 'center', fontSize: '0.9rem', mb: 0.5 }}>
                💡 Your chats will be AI-summarized after the call — view in History
              </Typography>
          )}

          <div className="lobbyTextField">
            <TextField
              id="outlined-basic"
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              variant="outlined"
              required
            />
            <Button variant="contained" onClick={connect}>
              Connect
            </Button>
          </div>

          <div className='lobbySelfVideoPreview'>
            <video ref={localVideoRef} autoPlay muted playsInline/>
          </div>
        </div>

      </ThemeProvider>

      ) : (

        <div className='meetVideoContainer'>

        {showModal ? 
          <div className='chatRoom'>

            <div className='chatContainer'>
             
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "10px" }}>
              <h1>Chat Room</h1>
              <IconButton onClick={() => setShowModal(false)} style={{ color: "black" }}>
                <CloseIcon />
              </IconButton>
            </div>

              <div className="chatDisplay">

                { messages.length > 0 ? 
                  messages.map((mssg, index) => {
                    return (
                      <div className='chatMessages' key={index}>
                        <p style={{fontWeight: "bold", color: "black"}}> {mssg.sender} </p>
                        <p> {mssg.data} </p>
                      </div>
                    )

                  }) : <p style={{fontSize: "18px"}}> No Messages Yet! </p> 
                }

              </div>

              <div className="chatArea">
                <TextField 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  id="outlined-basic" 
                  label="Enter Message" 
                  variant="outlined"
                  multiline        // enables multi-line input
                  maxRows={2}      // max 2 lines before scrollbar appears
                />
                <Button variant='contained' onClick={sendMessage}> Send </Button>
              </div>
            </div>

          </div> 
          : null 
        }

          <div className="buttonContainers">

            <IconButton onClick={handleVideo} style={{color: "white"}}>
              { (video === true) ? <VideocamIcon /> : <VideocamOffIcon /> }
            </IconButton>

             <IconButton onClick={handleEndCall} style={{color: "red"}}>
              <CallEndIcon /> 
            </IconButton>

             <IconButton onClick={handleAudio} style={{color: "white"}}>
             { (audio == true) ? <MicIcon /> : <MicOffIcon /> }
            </IconButton>

            {screenAvailable === true ? 
              <IconButton onClick={handleScreen} style={{color: "white"}}>
                { screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon /> }
              </IconButton> : <></>
            }

            {showInfo && (
              <div className="infoPopup">
                <p>Share this link to invite others</p>

                <div className="infoPopupRow">
                  <input readOnly value={window.location.href} />
                  <button onClick={handleCopy}>
                     {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            <IconButton onClick={() => setShowInfo(!showInfo)} style={{color: showInfo ? "#9c7de0" : "white"}}>
              <InfoOutlinedIcon />
            </IconButton>

            <Badge badgeContent={newMessages} max={999} color='secondary'>
              <IconButton onClick={() => setShowModal(!showModal)} style={{color: showModal ? "#9c7de0" : "white"}}>
                <ChatIcon  className='chatIconSvg'/> 
              </IconButton>
            </Badge>

          </div>
          
          {/* Self Video Preview */}
          {videoAvailable && (
            <>
              <video className='meetUserSelfVideo' ref={localVideoRef} autoPlay muted playsInline/>
              <div className='selfVideoLabel'>{username} (You)</div>
            </>
          )}
          
          <div className='conferenceView'>
            {videos.map((video) => (

              <div key={video.socketId} style={{ position: "relative" }} >

                <video 

                  data-socket={video.socketId}  //data-socket is just the name of the variable, not an attribute
                  
                  //We can't directly use src attribute since it handles only video/links and we only have videoStream
                  //One doubt: Then why above   <video ref = {localVideoRef} autoPlay muted> </video> doesn't use srcObject to handle videoStream
                  ref={ref => {    
                      if (ref && video.stream && ref.srcObject != video.stream){
                        ref.srcObject = video.stream;
                      }
                  }}

                  autoPlay
                  playsInline 
                >
                </video>

                <div className="videoLabel">
                  {video.username || "Guest"}
                </div>
              
              </div>
              
            ))}
          </div>

        </div>

      )}
    </div>

  );
}