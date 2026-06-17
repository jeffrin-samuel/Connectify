import "dotenv/config";

import express from "express";

import {createServer} from "node:http"; // Wraps Express to expose raw HTTP server for WebSocket upgrade
import {connectToSocket} from "./controllers/socketManager.js"; // Enables real-time bidirectional communication for WebRTC signaling

import mongoose from "mongoose";

import cors from "cors";
import userRoutes from "./routes/usersRoutes.js";

const app = express(); 
const server = createServer(app);  // Bridges Express with raw HTTP server
const io = connectToSocket(server); // Attaches Socket.io to HTTP server for real-time communication

const port = process.env.PORT || 8080;

app.use(cors()); // Allows cross-origin requests from frontend to backend
app.use(express.json({limit: "40kb"})); // Parses incoming JSON request body, capped at 40kb
app.use(express.urlencoded({limit: "40kb", extended: true}));  // Parses URL-encoded form data into req.body, capped at 40kb

app.use("/api/users", userRoutes); // Mounts user routes under /api/users — prefix separates API endpoints from static routes

const start = async() => {
    
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is missing");
    }

    const connectionDb = await mongoose.connect(mongoUri);
    console.log(`Mongo Connected DB Host: ${connectionDb.connection.host}`);

    server.listen(port, ()=> {
        console.log(`Listening on ${port}  => http://localhost:${port}`);
    })
}

start();