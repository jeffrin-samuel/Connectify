# Connectify Backend — Developer Notes

---

## Table of Contents

1. [Express vs Node.js](#1-express-vs-nodejs)
2. [createServer & Socket.io](#2-createserver--socketio)
3. [app.use Middleware](#3-appuse-middleware)
4. [bcrypt Hashing & Salting](#4-bcrypt-hashing--salting)
5. [crypto.randomBytes Token](#5-cryptorandombytes-token)
6. [REST Design Conventions](#6-rest-design-conventions)
7. [Mongoose & Schema](#7-mongoose--schema)
8. [ES Modules & Imports](#8-es-modules--imports)
9. [Router & Routes](#9-router--routes)
10. [package.json Scripts](#10-packagejson-scripts)
11. [WebSocket Upgrade Explained](#11-websocket-upgrade-explained)
12. [httpStatus Library](#12-httpstatus-library)

13. [Socket Manager — Complete Deep Dive](#13-socket-manager--complete-deep-dive-connecttosocket)

    - [The Big Picture](#the-big-picture)
    - [The 3 State Objects](#the-3-state-objects)
    - [io vs socket](#io-vs-socket--the-most-important-distinction)
    - [io.emit vs socket.emit vs io.to](#ioemit-vs-socketemit-vs-ioto--when-to-use-what)
    - [Complete Flow Chart](#complete-flow-chart)
    - [Event 1 — join-call](#event-1--join-call)
    - [Event 2 — signal](#event-2--signal)
    - [Event 3 — chat-message](#event-3--chat-message)
    - [Event 4 — disconnect](#event-4--disconnect)
    - [Deep Copy](#deep-copy--jsonstringify--jsonparse)
    - [JS vs C++](#js-vs-cpp--reference-vs-value)
    - [reduce() Breakdown](#reduce--full-breakdown)
    - [indexOf + splice](#why-indexof--splice-to-remove-socket-id)
    - [How Client A knows Client B's socket ID](#how-client-a-knows-client-bs-socket-id)
    - [Random Meeting URL](#random-meeting-url--who-generates-it)

---

## 1. Express vs Node.js

**Why Express when we already have Node.js?**

Node.js alone can create a server but it's very raw and painful.
To handle a simple GET request in plain Node.js:

```js
if (req.method === 'GET' && req.url === '/users') {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
```

Express simplifies this to just:

```js
app.get('/users', (req, res) => res.json(data));
```

Express is basically a wrapper over Node.js that makes building APIs clean, simple and readable.
It gives you: routing, middleware, request/response helpers etc.

---

## 2. createServer & Socket.io

**Why createServer? Why new Server(server)?**

```js
const app = express();          // Express instance to handle REST API routes
const server = createServer(app); // Bridges Express with raw HTTP server
const io = new Server(server);    // Attaches Socket.io to HTTP server for real-time communication
```

- Express alone only understands HTTP (request → response, done).
- But Socket.io needs a PERSISTENT connection (like a phone call).
- To set that up, Socket.io needs access to the raw HTTP server to intercept the "upgrade" from HTTP → WebSocket.
- `createServer(app)` wraps Express and exposes that raw server.
- `new Server(server)` attaches Socket.io to the raw HTTP server.
- Now both Express (REST API) and Socket.io (real-time) run on the same port simultaneously.

**ANALOGY:**
```
app    = the restaurant (handles normal orders)
server = the building the restaurant is inside
io     = a phone line installed in that same building for real-time communication
```

**THE FLOW:**
```
express()          → creates the Express app (handles REST API routes)
createServer(app)  → wraps Express into a raw HTTP server
new Server(server) → Socket.io taps into that raw server for WebSocket communication
```

**WebRTC Signaling Flow:**
```
Client A ──signaling──▶ Socket.io Server ──signaling──▶ Client B
Client A ◀────────── direct P2P video/audio ──────────▶ Client B
```
Socket.io handles signaling (offers, answers, ICE candidates).
WebRTC handles the actual peer-to-peer video/audio stream directly between browsers.

---

## 3. app.use Middleware

**What is app.use() and why do we use cors, express.json, express.urlencoded?**

`app.use()` registers middleware that runs on EVERY incoming request.
Middleware is like a security checkpoint — every request passes through it before reaching your actual route handlers.

### cors()
- By default browsers block requests from a different domain.
- Ex: frontend on `localhost:3000` calling backend on `localhost:8000` would be blocked without cors().
- `cors()` allows it.
- Without any config it allows ALL origins (restrict it later with frontend URL in production).

### express.json()
- Parses incoming request body from raw string → usable JS object (basically automated `JSON.parse()`)
- When frontend sends `{ name: "Jeff", email: "jeff@gmail.com" }`, this converts it into `req.body`.
- `limit: "40kb"` rejects payloads larger than 40kb to prevent server overload (DoS) attacks.
- **Payload** = the data sent in the request body.

### express.urlencoded()
- Parses HTML form data sent as `key=value&key2=value2` format (URL encoded) into `req.body`.
- `extended: true` allows nested objects to be parsed.
- `limit: "40kb"` caps payload size same as above.

---

## 4. bcrypt Hashing & Salting

**How does bcrypt.hash(password, 10) work internally?**

```js
const hashedPassword = await bcrypt.hash(password, 10);
```

- `bcrypt.hash()` handles both salting AND hashing internally — no need to do them separately.
- You just pass: plain `password` + cost factor `10` (rounds in x format → runs 2^x internally).

**What is Salting?**
- Hashing alone: same password always → same hash (vulnerable to rainbow table attacks)
- Salting: adds random characters to password BEFORE hashing → same password → different hash every time

**bcrypt internally:**
1. Generates a 16-byte random salt
2. Encodes salt in Base64 (16 bytes = 128 bits / 6 bits per Base64 char = ~22 characters)
3. Combines `password + salt`
4. Runs hashing algorithm `2^10 = 1024` times on that combination
5. Returns a fixed **60-character** string with salt embedded

**Base64 Encoding:**
- Represents binary data using 64 characters: `A-Z, a-z, 0-9, +, /`
- Each Base64 character = 6 bits (since 2^6 = 64 possible characters)

**Final 60-char bcrypt output breakdown:**
```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHwy
|--||-| |------22 chars------||----------31 chars------------|
ver rnd      salt (Base64)         hash output (Base64)

$2b$10$                          →  7 chars   (version + cost factor prefix)
N9qo8uLOickgx2ZMRZoMye          →  22 chars  (16 byte salt in Base64)
IjZAgcfl7p92ldGxad68LJZdL17lHwy →  31 chars  (23 byte hash in Base64)
─────────────────────────────────────────────
Total                            =  60 characters
```

**Cost factor:**
- `10` means hashing runs `2^10 = 1024` times internally
- Higher rounds = slower brute force for attackers = more secure
- `10` is the industry standard balance between security and performance

---

## 5. crypto.randomBytes Token

**How is the session token generated?**

```js
let token = crypto.randomBytes(20).toString("hex");
```

- `crypto.randomBytes(20)` generates 20 random bytes of cryptographically secure random data
- `20 bytes = 160 bits`
- `.toString("hex")` converts bytes to hexadecimal string
- In hex: 1 byte = 2 characters (1 byte = 8 bits = 2 nibbles, each nibble = 4 bits = 1 hex char)
- So 20 bytes → **40 character hex string**
- Example: `"a3f8c2d1e9b4a7f6c2d1e9b4a7f6c2d1e9b4a7f6"`

**Why only send token to client and not full user object?**
- Only the token is sent to client and stored in localStorage — not the entire user object.
- Storing sensitive data (password, email etc.) in localStorage is risky.
- Any JavaScript on that page can access localStorage via `localStorage.getItem()` — vulnerable to XSS attacks.
- Token-only approach minimizes exposure — even if stolen, it reveals nothing sensitive.

**Hex vs Base64:**
- Hex: each character = 4 bits → 1 byte = 2 characters
- Base64: each character = 6 bits → 1 byte = 1.33 characters (more compact)
- bcrypt uses Base64 (compact), crypto token uses hex (readable)

**Optional Enhancement — Auto Logout with Cron Job**

If we want to automatically log out users after a set time (ex: 20 mins):
- Set up a cron job on the server that runs every 20 mins
- Clears the token field from the user's document in MongoDB
- Client's stored token in localStorage becomes invalid
- Server rejects requests to protected routes since token no longer matches
- User gets automatically logged out

```js
// Example using node-cron
cron.schedule("*/20 * * * *", async () => {
    await User.updateMany({}, { token: null }); // clears all tokens every 20 mins
});
```

This is cleaner than JWT expiry for simple session management without adding JWT complexity.

---

## 6. REST Design Conventions

**What is REST? What is RESTful?**

- **REST** = Representational State Transfer — a set of rules/conventions for designing APIs.
- **RESTful** = an API that follows those REST rules.

**Core Rule: URLs are NOUNS, HTTP methods are VERBS**

| Method | Action | Example |
|--------|--------|---------|
| GET | Fetch data | GET `/activities` → get all |
| POST | Create new | POST `/activities` → add new |
| PUT | Update entire | PUT `/activities/1` → update activity 1 |
| PATCH | Update partial | PATCH `/activities/1` → update one field |
| DELETE | Delete | DELETE `/activities/1` → delete activity 1 |

**Good vs Bad URL naming:**
```
❌ /get_all_activity   (verb in URL — wrong)
❌ /add_to_activity    (verb in URL — wrong)
✅ GET  /activities    (noun + HTTP method — correct)
✅ POST /activities    (noun + HTTP method — correct)
```

**Same URL, different methods:**
```js
router.route("/activities")
  .get(getAllActivities)  // GET  /api/users/activities → fetch all
  .post(addActivity)      // POST /api/users/activities → add new
```

---

## 7. Mongoose & Schema

**What is Mongoose?**

Mongoose is an ODM (Object Data Modeling) library for MongoDB in Node.js.
MongoDB stores raw JSON-like documents with no enforced structure.
Mongoose sits between your Node/Express server and MongoDB, letting you define schemas and models.

**Without Mongoose (raw MongoDB driver):**
```js
db.collection('users').insertOne({ name: 'Jeff', email: 'jeff@example.com' })
```

**With Mongoose:**
```js
const user = new User({ name: 'Jeff', email: 'jeff@example.com' });
await user.save();
```

**What Mongoose gives you:**
- Schema definition — enforce shape and types on documents
- Validation — `required`, `minLength`, custom validators
- Model methods — `find`, `findById`, `findOneAndUpdate`, `deleteOne` etc.
- Middleware (hooks) — run logic before/after save, delete etc.
- Population — lightweight joins between collections

**new Schema() — what does `new` do?**

- `Schema` is a **class** (blueprint/template)
- `new` is the keyword that builds a fresh object from that class
- The result stored in `userSchema` is an **instance** — one specific object built from the class

```
Class    = cookie cutter
new      = pressing the cookie cutter into dough
Instance = the actual cookie you get
```

```js
const userSchema = new Schema({...}); // instance of Schema class
const postSchema = new Schema({...}); // another separate instance
```

Both created from the same Schema class but completely independent objects in memory.

---

## 8. ES Modules & Imports

**Why `node:http` prefix?**

```js
import { createServer } from "node:http";
// Same as:
import { createServer } from "http";
```

`node:` prefix explicitly says "this is a core built-in Node module, not an npm package."
Both work, `node:` is the modern explicit convention.

**`"type": "module"` in package.json**

- Enables ES module syntax (`import/export`) across all `.js` files
- Without it, Node.js defaults to CommonJS (`require/module.exports`)
- Always add `.js` extension in import paths when using ES modules:

```js
import User from "../models/userModels.js"; // ✅ correct
import User from "../models/userModels";    // ❌ will error
```

**`export default` vs named export `{ }`**

```js
// Named export — use when a file exports MULTIPLE things
export { User };
export { Meeting };
// import: import { User } from "./userModels.js"

// Default export — use when a file exports ONE thing (more common in MERN)
export default User;
// import: import User from "./userModels.js"
```

- Named export `{ }` → imported with exact same name in curly braces
- Default export → imported with ANY name you choose, no curly braces
- Since each model file exports one thing, `export default` is the cleaner MERN convention

---

## 9. Router & Routes

**What is Router() and why use it?**

```js
const router = Router(); // Creates an independent router instance to define and manage user-related routes
```

- `Router()` is a factory function — a function whose job is to create and return a new object every time called.
- Each route file gets its own fresh independent router object with built-in HTTP methods.
- Avoids repeating the base URL prefix in every route definition.

**Mounting router in app.js:**
```js
app.use("/api/users", userRoutes); // Mounts all user-related routes under the /api/users prefix
```

Now routes automatically become:
```
/api/users/login
/api/users/register
/api/users/activities
```

**Factory function vs Class:**
```js
const router = Router();      // Factory function — no `new` needed
const schema = new Schema();  // Class/Constructor — needs `new`
```
Both return objects with methods. Just different ways of creating them.

---

## 10. package.json Scripts

**What do the scripts do?**

```json
"scripts": {
  "start": "node src/app.js",       // Production: run with plain Node.js
  "dev": "nodemon src/app.js",      // Development: auto-restarts on file changes
  "prod": "pm2 start src/app.js --name connectify-backend" // Production process manager
}
```

- **nodemon** — watches files, auto-restarts server on code changes (dev only)
- **pm2** — production process manager, auto-restarts on crashes, keeps app alive after terminal closes
- `--name connectify-backend` — labels the process in pm2's process list for easy identification

**devDependencies vs dependencies:**
- `dependencies` — needed in production (express, mongoose, socket.io etc.)
- `devDependencies` — only needed during development (nodemon)

**`--save-exact` vs `--save`:**
- `--save` — redundant since npm v5, packages auto-save to package.json
- `--save-exact` — locks exact version, removes `^`, prevents future auto-updates that could break your app

---

---

## 11. WebSocket Upgrade Explained

**Why does Socket.io need a protocol upgrade?**

Normal HTTP (Express) is like sending a **letter**
- You send a request, you get a response, connection closes. Done.

WebSocket (Socket.io) is like a **phone call**
- Connection stays open, both sides can talk anytime in real time.

Express only knows how to handle letters. That's all it's built for.
But to make a phone call, you need the actual phone line — which is the raw HTTP server.
Socket.io taps into that phone line and says:
"Hey, this person wants to switch from sending letters to making a phone call — let me handle that."

That switching moment is called a **protocol upgrade** — going from HTTP → WebSocket.
Express never sees it, it happens at a lower level.

---

## 12. httpStatus Library

**Why use `httpStatus` instead of raw numbers?**

```js
// ❌ Raw numbers — unclear, easy to misremember
res.status(302).json({...})

// ✅ httpStatus — readable, self-documenting
res.status(httpStatus.FOUND).json({...})
```

- Raw numbers like `302`, `404`, `500` are hard to remember and unclear to anyone reading the code
- `httpStatus` maps those numbers to readable constants
- Makes code self-documenting — `httpStatus.NOT_FOUND` is instantly clear, `404` is not
- Reduces bugs from mistyping numbers
- Common ones used in Connectify:
  - `httpStatus.OK` → 200
  - `httpStatus.CREATED` → 201
  - `httpStatus.FOUND` → 302
  - `httpStatus.NOT_FOUND` → 404
  - `httpStatus.INTERNAL_SERVER_ERROR` → 500

---

## 13. Socket Manager — Complete Deep Dive (connectToSocket)


# The Big Picture

```
FRONTEND (React)          BACKEND (Socket.io Server)         OTHER CLIENTS
     |                            |                               |
     |--- socket.emit() --------->|                               |
     |                            |--- io.to(id).emit() -------->|
     |<-- socket.on() -----------|                               |
     |                            |                               |
```

Socket.io server acts as a **relay/postman** — it never processes video/audio itself.
It only passes signaling data (who wants to call who, offers, answers, ICE candidates) between clients.
Once WebRTC connection is established, video/audio flows **directly peer-to-peer**, bypassing the server entirely.

---

## The 3 State Objects

```javascript
let connections = {}  // tracks who is in which room
let messages = {}     // stores chat history per room
let timeOnline = {}   // tracks when each user joined
```

These are **EMPTY OBJECTS** `{}` — not arrays `[]`.

JavaScript objects act like a dictionary/hashmap — key → value pairs.

### What connections looks like at runtime:

```javascript
connections = {
  "/room/abc123": ["socketId1", "socketId2", "socketId3"],  // room 1, 3 people
  "/room/xyz789": ["socketId4"],                             // room 2, 1 person
  "/room/mno456": ["socketId5", "socketId6"]                // room 3, 2 people
}
```

Think of it like a **hotel building**:
- One building (`connections` object) holds multiple rooms
- Each room (key) has a list of guests (array of socket IDs)
- One `connections` object tracks ALL rooms simultaneously

### What messages looks like at runtime:

```javascript
messages = {
  "/room/abc123": [
    { data: "Hello everyone!", sender: "Jeff", "socket-id-sender": "socketId1" },
    { data: "Hi Jeff!", sender: "John", "socket-id-sender": "socketId2" }
  ],
  "/room/xyz789": [
    { data: "Hey!", sender: "Sarah", "socket-id-sender": "socketId4" }
  ]
}
```

### What timeOnline looks like at runtime:

```javascript
timeOnline = {
  "socketId1": Date(2024-01-01T10:00:00),
  "socketId2": Date(2024-01-01T10:02:00),
  "socketId4": Date(2024-01-01T10:05:00)
}
```

### Why can we do `timeOnline[socket.id] = new Date()` on an empty object?

JavaScript objects are **dynamic** — you can add keys anytime, unlike C++ fixed-size arrays:

```javascript
let timeOnline = {};
timeOnline["socket123"] = new Date(); // works perfectly ✅
// Now: timeOnline = { "socket123": Date(...) }
```

No initialization needed. JS just creates the key on the fly.

---

## io vs socket — The Most Important Distinction

```
io     = the entire SERVER (building)
socket = ONE specific user's connection (one person in the building)
```

```javascript
io.on("connection", (socket) => {
    // io.on = SERVER LEVEL
    // Fires when ANY new user connects
    // socket parameter = that specific new user's connection object

    socket.on("join-call", () => { ... })
    // socket.on = USER LEVEL
    // Listens for events from THIS specific user only
})
```

### Simple Rule — When to use what:

| Situation | Use |
|-----------|-----|
| Detecting a new user connecting to server | `io.on("connection")` |
| Listening for events from a specific user | `socket.on(...)` |
| Sending to ALL users everywhere | `io.emit(...)` |
| Sending to one specific user | `io.to(socketId).emit(...)` |
| Sending back to the current user | `socket.emit(...)` |
| Sending to everyone EXCEPT current user | `socket.broadcast.emit(...)` |

### Analogy:
```
io     = school PA system (broadcasts to entire school)
socket = walkie talkie between you and one specific person
```

### How does socket always know WHICH user it refers to?

**Closures.** When `socket.on("join-call")` runs, it remembers the `socket` from the outer `io.on("connection")` scope:

```javascript
io.on("connection", (socket) => {
    // socket = User A's connection (e.g. socketId = "xK92pL")

    socket.on("join-call", (path) => {
        // socket STILL = User A's connection
        // JS closure keeps that reference alive automatically
        console.log(socket.id) // always "xK92pL" — User A
    })
})
```

Every new user gets their own **separate execution** of the entire `io.on("connection")` block with their own `socket`. So there's no confusion between users.

---

## io.emit vs socket.emit vs io.to — When to Use What

```javascript
io.emit("event", data)
// Sends to EVERY connected user regardless of room
// Use for: global announcements, server shutdowns, emergency messages
// Example: io.emit("server-shutdown", "Restarting in 5 mins")
// Rarely used in Connectify

io.to(specificSocketId).emit("event", data)
// Sends to ONE specific user by their socket ID
// Most commonly used in Connectify
// Example: io.to("xK92pL").emit("user-joined", socket.id)

socket.emit("event", data)
// Sends back to THIS specific user only
// The user who triggered the current event
// Example: send old chat messages only to the person who just joined

socket.broadcast.emit("event", data)
// Sends to EVERYONE except THIS specific user
// socket.broadcast automatically knows to exclude the current socket
// No need to specify who to exclude — implied by which socket you're in
```

---

## Complete Flow Chart

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER OPENS THE APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         │
         ▼
Browser establishes WebSocket connection to server
         │
         ▼
io.on("connection", (socket) => { ... })
SERVER FIRES — assigns unique socket.id to this user
         │
         ▼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER CLICKS "JOIN MEETING"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         │
         ▼
Frontend: socket.emit("join-call", "/room/abc123")
         │
         ▼
socket.on("join-call", (path) => { ... }) FIRES ON SERVER
         │
         ├─── Add socket.id to connections[path]
         ├─── Record timeOnline[socket.id] = new Date()
         ├─── Tell EVERYONE in room: io.to(each).emit("user-joined", socket.id)
         └─── If chat history exists: send old messages to new joiner via socket.emit(...)
         │
         ▼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEBRTC SIGNALING (after user-joined event received on frontend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         │
         ▼
Client A creates WebRTC Offer → socket.emit("signal", clientB_socketId, offerData)
         │
         ▼
socket.on("signal", (toId, message) => { ... }) FIRES ON SERVER
         │
         ▼
Server relays: io.to(toId).emit("signal", socket.id, message)
(Server is just a postman here — doesn't read the signal, just forwards it)
         │
         ▼
Client B receives offer → creates Answer → socket.emit("signal", clientA_socketId, answerData)
         │
         ▼
Same relay happens back to Client A
         │
         ▼
ICE Candidates exchanged same way via "signal" events
         │
         ▼
WebRTC P2P connection established ✅
Video/Audio now flows DIRECTLY between clients (bypasses server)
         │
         ▼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER SENDS A CHAT MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         │
         ▼
Frontend: socket.emit("chat-message", "Hello!", "Jeff")
         │
         ▼
socket.on("chat-message", (data, sender) => { ... }) FIRES ON SERVER
         │
         ├─── Find which room this socket.id belongs to (using reduce)
         ├─── Save message to messages[matchingRoom]
         ├─── Forward to EVERYONE in that room via forEach + io.to(each).emit(...)
         │
         ▼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER LEAVES / CLOSES TAB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         │
         ▼
socket.on("disconnect", () => { ... }) AUTO FIRES ON SERVER
         │
         ├─── Calculate time spent online (new Date() - timeOnline[socket.id])
         ├─── Find which room this socket.id was in (deep copy loop)
         ├─── Tell everyone in that room: io.to(each).emit("user-left", socket.id)
         ├─── Remove socket.id from connections[roomKey] using indexOf + splice
         └─── If room is now empty → delete connections[roomKey] (free memory)
         │
         ▼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Event 1 — join-call

```javascript
socket.on("join-call", (path) => {

    if(connections[path] === undefined){
        connections[path] = [];
    }
    connections[path].push(socket.id);
```

- `path` = the meeting room URL e.g. `/room/abc123`
- If this room doesn't exist yet in `connections`, create an empty array for it
- Add this user's socket ID to that room's array

```javascript
    timeOnline[socket.id] = new Date();
```

- Record join time for this user
- If user disconnects and rejoins → they get a brand new `socket.id` → fresh entry (old one gone)

```javascript
    for(let i = 0; i < connections[path].length; i++){
        io.to(connections[path][i]).emit("user-joined", socket.id);
    }
```

- Loop through everyone in the room (including the new joiner)
- Tell each of them — "a new person joined, here's their socket ID"
- This triggers WebRTC peer connection setup on the frontend

```javascript
    if(messages[path] !== undefined){
        for(let i = 0; i < messages[path].length; ++i){
            io.to(socket.id).emit("chat-message",
                messages[path][i]['data'],
                messages[path][i]['sender'],
                messages[path][i]['socket-id-sender']
            )
        }
    }
```

- If chat history exists for this room, send ALL previous messages to the new joiner only
- Like WhatsApp showing old group messages when you first open a group
- `io.to(socket.id)` = send only to the new joiner, not everyone

---

## Event 2 — signal

```javascript
socket.on("signal", (toId, message) => {
    io.to(toId).emit("signal", socket.id, message);
});
```

- Triggered when a client wants to send WebRTC signaling data to another client
- `toId` = target client's socket ID
- `message` = the actual signaling data (offer / answer / ICE candidate)
- Server is just a **postman** — it doesn't understand or process the signal, just forwards it
- This fires for EVERY offer, answer, and ICE candidate exchange

---

## Event 3 — chat-message

```javascript
socket.on("chat-message", (data, sender) => {

    const [matchingRoom, found] = Object.entries(connections)
    .reduce(([room, isFound], [roomKey, roomValue]) => {
        if(!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
        }
        return [room, isFound];
    }, ['', false]);
```

See [reduce() Full Breakdown](#reduce--full-breakdown) below for detailed explanation.

```javascript
    if(found === true){
        if(messages[matchingRoom] === undefined){
            messages[matchingRoom] = []
        }
        messages[matchingRoom].push({
            "sender": sender,
            "data": data,
            "socket-id-sender": socket.id
        });

        connections[matchingRoom].forEach(elem => {
            io.to(elem).emit("chat-message", data, sender, socket.id);
        });
    }
```

- `elem` = each attendee's socket ID in that room (yes, your understanding was correct)
- Save message to chat history first, then forward to everyone in the room
- `socket.id` sent along so frontend can identify who sent the message (more reliable than username alone)

---

## Event 4 — disconnect

```javascript
socket.on("disconnect", () => {
    let diffTime = Math.abs(timeOnline[socket.id] - new Date());
```

- Auto fires when user closes tab, loses internet, or navigates away
- `diffTime` = how long this user was online (in milliseconds)

```javascript
    for (const[room, attendees] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
```

- Deep copy of connections for safe iteration (see Deep Copy section below)
- `room` = room key/URL
- `attendees` = array of socket IDs in that room

```javascript
        for(let i = 0; i < attendees.length; ++i){
            if(attendees[i] == socket.id){
                roomKey = room;

                for(let j = 0; j < connections[roomKey].length; ++j){
                    io.to(connections[roomKey][j]).emit('user-left', socket.id);
                }

                let index = connections[roomKey].indexOf(socket.id);
                connections[roomKey].splice(index, 1);

                if(connections[roomKey].length == 0){
                    delete connections[roomKey];
                }
            }
        }
```

- Find the room this socket ID belongs to
- Tell everyone in that room — "this person left"
- Remove their socket ID from the room's array
- If room is now empty → delete it from `connections` to free memory

---

## Deep Copy — JSON.stringify + JSON.parse

```javascript
JSON.parse(JSON.stringify(Object.entries(connections)))
```

### Why do we need a deep copy here?

We're looping through `connections` AND modifying it (splicing, deleting) at the same time.
Modifying an object while looping through it causes bugs/unpredictable behavior.
Solution: loop through a COPY, modify the ORIGINAL.

### Don't stringify and parse cancel each other out?

They convert back to the same STRUCTURE — but create a brand new object in MEMORY:

```javascript
let original = { a: [1, 2, 3] };

// WITHOUT deep copy (reference copy — both point to same memory):
let copy = original;
copy.a.push(4);
console.log(original.a); // [1,2,3,4] ← ORIGINAL AFFECTED ❌

// WITH deep copy (new object in memory):
let copy = JSON.parse(JSON.stringify(original));
copy.a.push(4);
console.log(original.a); // [1,2,3] ← ORIGINAL SAFE ✅
```

### Step by step what happens:

```javascript
// Step 1 — Object.entries converts connections object to array:
Object.entries(connections)
// Result (new array, original connections untouched):
[
  ["/room/abc", ["socket1", "socket2"]],
  ["/room/xyz", ["socket3"]]
]

// Step 2 — JSON.stringify converts entire array to a STRING (breaks all memory references):
'[["/room/abc",["socket1","socket2"]],["/room/xyz",["socket3"]]]'

// Step 3 — JSON.parse converts string back to array (brand new object in memory):
[
  ["/room/abc", ["socket1", "socket2"]],   // NEW array in memory
  ["/room/xyz", ["socket3"]]               // completely separate from original
]
```

Same structure, **different memory address**. That's the deep copy. They "cancel out" the format but NOT the memory reference.

### Modern alternative (cleaner):

```javascript
structuredClone(Object.entries(connections)) // ES2022 — does the same thing
```

---

## JS vs C++ — Reference vs Value

| | Primitives (int, string, bool) | Objects / Arrays |
|--|--|--|
| **C++** | Deep copy by default | Depends (pointer = reference, value type = copy) |
| **JS** | Deep copy by default | Reference copy by default ⚠️ |

```javascript
// JS Primitives — deep copy by default (safe)
let a = 5;
let b = a;
b = 10;
console.log(a); // still 5 ✅

// JS Objects/Arrays — reference copy by default (dangerous)
let a = [1, 2, 3];
let b = a;        // b points to SAME array in memory
b.push(4);
console.log(a);   // [1,2,3,4] ❌ original affected
```

```cpp
// C++ non-pointer — deep copy (safe)
int a = 5;
int b = a;
b = 10;
cout << a; // still 5 ✅

// C++ pointer — reference (same as JS objects)
int* a = new int(5);
int* b = a;   // b points to SAME memory
*b = 10;
cout << *a;   // 10 ❌ original affected
```

**Rule:** In JS, always manually deep copy objects/arrays if you don't want the original affected.

---

## reduce() — Full Breakdown

```javascript
const [matchingRoom, found] = Object.entries(connections)
.reduce(([room, isFound], [roomKey, roomValue]) => {
    if(!isFound && roomValue.includes(socket.id)) {
        return [roomKey, true];
    }
    return [room, isFound];
}, ['', false]);
```

### Why Object.entries() first?

`connections` is an object. You can't call `.reduce()` on objects — only on arrays.
`Object.entries()` converts it to an iterable array. Original `connections` is NOT affected.

### Breaking down reduce():

```
.reduce(callback, initialValue)
         │              │
         │              └── ['', false]
         │                  accumulator starts as: [room='', isFound=false]
         │
         └── ([room, isFound], [roomKey, roomValue]) => { ... }
              │                 │
              │                 └── current item being iterated
              │                     roomKey = "/room/abc123"
              │                     roomValue = ["socket1", "socket2"]
              │
              └── accumulator (result so far)
                  room = matching room found so far (starts as '')
                  isFound = whether we found it yet (starts as false)
```

### Does reduce() stop when it finds the room?

**No** — reduce() always iterates through everything. But `!isFound` check prevents overwriting:

```javascript
if(!isFound && roomValue.includes(socket.id)) {
    return [roomKey, true];   // found → update accumulator
}
return [room, isFound];       // not found yet OR already found → keep accumulator unchanged
```

Once `isFound = true`, the condition `!isFound` always fails → accumulator stays as the found room forever.

### Why explicit return?

Arrow functions with `{}` curly braces need explicit `return`.
Without curly braces → implicit return:

```javascript
// Implicit return (no curly braces):
const add = (a, b) => a + b;

// Explicit return (curly braces):
const add = (a, b) => {
    return a + b;
}
```

### How do `room` and `isFound` get their default values?

They're not uninitialized — they come from **destructuring the accumulator array**:

```javascript
// Accumulator starts as ['', false]
// JS destructures it into:
// room    = ''    (first element)
// isFound = false (second element)
```

No magic — just array destructuring of the initial value `['', false]`.

### Final result:

```javascript
const [matchingRoom, found] = ...
// matchingRoom = "/room/abc123" (the room this sender is in)
// found = true
```

---

## Why indexOf + splice to remove socket ID

```javascript
let index = connections[roomKey].indexOf(socket.id);
connections[roomKey].splice(index, 1);
```

`connections[roomKey]` is an **array** — arrays don't have a "delete by value" method:

```javascript
connections[roomKey].delete(socket.id)  // ❌ doesn't exist on arrays
connections[roomKey].remove(socket.id)  // ❌ doesn't exist in JS
```

So the two step approach:
1. `indexOf(socket.id)` → find the position (index number) of that socket ID in the array
2. `splice(index, 1)` → remove exactly 1 element at that position

```javascript
// Example:
let arr = ["socket1", "socket2", "socket3"];
let index = arr.indexOf("socket2"); // index = 1
arr.splice(1, 1);                   // remove 1 element at position 1
// arr is now ["socket1", "socket3"] ✅
```

---

## How Client A knows Client B's socket ID

When Client B joins the room, server fires:

```javascript
io.to(connections[path][i]).emit("user-joined", socket.id);
```

This tells EVERYONE in the room — "Client B just joined, their socket ID is `xyz789`."

Client A receives this `user-joined` event on the frontend and stores Client B's socket ID.
Then when Client A wants to send a WebRTC offer to Client B:

```javascript
// Frontend (Client A):
socket.emit("signal", "xyz789", offerData); // uses Client B's socket ID
```

So the server informed Client A of Client B's ID via `user-joined`. That's the handshake.

---

## Random Meeting URL — Who generates it?

**Frontend generates it** — Socket.io doesn't handle this.

```javascript
// Frontend example:
const roomId = Math.random().toString(36).substring(2, 9); // "x7k2p9a"
window.location.href = `/meeting/${roomId}`;

// Then when joining:
socket.emit("join-call", `/meeting/${roomId}`);
```

That URL becomes the `path` (room key) in `connections` on the server.
Two users navigating to the same URL → same `path` → same room in `connections`.

---