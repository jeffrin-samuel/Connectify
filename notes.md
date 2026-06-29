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

14. [Context API & Auth Flow — Complete Deep Dive](#14-context-api--auth-flow--complete-deep-dive)

    - [What is Context API and Why](#what-is-context-api-and-why)
    - [createContext — Creating the Whiteboard](#createcontext--creating-the-whiteboard)
    - [axios.create — Pre-configured Axios Instance](#axioscreate--pre-configured-axios-instance)
    - [AuthProvider — The Wrapper Component](#authprovider--the-wrapper-component)
    - [children — Why We Need to Render It](#children--why-we-need-to-render-it)
    - [useContext vs useState with authContext](#usecontext-vs-usestate-with-authcontext)
    - [useState — Can it hold mixed data?](#usestate--can-it-hold-mixed-data)
    - [Shorthand Object Syntax in data](#shorthand-object-syntax-in-data)
    - [AuthContext.Provider — Writing to the Whiteboard](#authcontextprovider--writing-to-the-whiteboard)
    - [Why AuthProvider not AuthContext in App.jsx](#why-authprovider-not-authcontext-in-appjsx)
    - [Why Router must be ABOVE AuthProvider](#why-router-must-be-above-authprovider)
    - [useContext in Authentication.jsx](#usecontext-in-authenticationjsx--reading-the-whiteboard)
    - [handleRegister & handleLogin Flow](#handleregister--handlelogin-flow)
    - [Axios vs Native fetch](#axios-vs-native-fetch)
    - [Complete Auth Flow — End to End](#complete-auth-flow--end-to-end)

15. [STUN Server & TURN Server — Complete Deep Dive](#15-stun-server--turn-server--complete-deep-dive)

    - [What is a Firewall?](#what-is-a-firewall)
    - [Need of STUN Server](#need-of-stun-server)
    - [Drawback of STUN Server](#drawback-of-stun-server)
    - [What is TURN Server and How It Helps](#what-is-turn-server-and-how-it-helps)
    - [What is an ICE Candidate, Exactly?](#what-is-an-ice-candidate-exactly)
    - [The Flow — Host → STUN → TURN](#the-flow--host--stun--turn)
    - [Signaling Server vs STUN/TURN — The Corrected Full Flow](#signaling-server-vs-stunturn--the-corrected-full-flow)
    - [SDP vs ICE Candidates — Two Different Things](#sdp-vs-ice-candidates--two-different-things)
    - [Does TURN Change the Mesh Architecture?](#does-turn-change-the-mesh-architecture)
    - [The .json() Confusion — Fully Cleared](#the-json-confusion--fully-cleared)
    - [cachedIceServers & ensureIceServers Explained](#cachediceservers--ensureiceservers-explained)
    - [Frontend .env vs Backend .env — Security Note](#frontend-env-vs-backend-env--security-note)
    - [Full Code Reference](#full-code-reference)
    - [How to Verify TURN Is Actually Working](#how-to-verify-turn-is-actually-working)
    - [Entire Flow — Putting It All Together (Corrected)](#entire-flow--putting-it-all-together-corrected)
    - [Edge Case: TTL Expiry for Existing Long-Running Calls](#edge-case-ttl-expiry-for-existing-long-running-calls)
    - [Edge Case: Asymmetric NAT — When Only One Peer Needs Relay](#edge-case-asymmetric-nat--when-only-one-peer-needs-relay)

16. [React & JS Gotchas — VideoMeet Specific](#16-react--js-gotchas--videomeet-specific)

    - [React State Setter is Async — The Most Common Trap](#react-state-setter-is-async--the-most-common-trap)
    - [async/await vs React State — Why You Can't await a Setter](#asyncawait-vs-react-state--why-you-cant-await-a-setter)
    - [!! Double Bang — Existence Check Shorthand](#-double-bang--existence-check-shorthand)
    - [navigator — The Browser's Hardware Gateway](#navigator--the-browsers-hardware-gateway)
    - [MediaStream & Tracks — What They Actually Are](#mediastream--tracks--what-they-actually-are)
    - [track.stop() vs track.enabled — Two Very Different Things](#trackstop-vs-trackenabled--two-very-different-things)
    - [window.localStream — Why Global](#windowlocalstream--why-global)
    - [getUserMedia — Why Two Separate Calls](#getusermedia--why-two-separate-calls)
    - [getUserMedia Toggle Logic — Why Only Two Branches Needed](#getusermedia-toggle-logic--why-only-two-branches-needed)
    - [useEffect + State Setter Pattern — Why getMedia Works This Way](#useeffect--state-setter-pattern--why-getmedia-works-this-way)
    - [getDisplayMedia — Permission vs Feature Existence](#getdisplaymedia--permission-vs-feature-existence)
    - [VideoMeet — Complete Current Flow (Phase 1 & Phase 2)](#videomeet--complete-current-flow-phase-1--phase-2)
    - [localVideoRef — What It Is, Why It's Checked, and the Edge Case](#localvideoref--what-it-is-why-its-checked-and-the-edge-case)

17. [JWT Authentication — Complete Deep Dive](#17-jwt-authentication--complete-deep-dive)

    - [What JWT Actually Is](#what-jwt-actually-is)
    - [Session Token vs JWT — What Changed and Why](#session-token-vs-jwt--what-changed-and-why)
    - [How a JWT Token is Structured](#how-a-jwt-token-is-structured)
    - [Base64 Encoding — What It Actually Is](#base64-encoding--what-it-actually-is)
    - [HMAC SHA256 — How the Signature Works](#hmac-sha256--how-the-signature-works)
    - [How JWT Verification Works Internally](#how-jwt-verification-works-internally)
    - [Why a Fake Token Always Fails](#why-a-fake-token-always-fails)
    - [The Complete Auth Flow](#the-complete-auth-flow)
    - [withAuth HOC — Frontend Route Protection](#withauth-hoc--frontend-route-protection)
    - [authenticate Middleware — Backend Route Protection](#authenticate-middleware--backend-route-protection)
    - [Token Versioning — Invalidating Old Sessions](#token-versioning--invalidating-old-sessions)
    - [Axios Interceptor — Global 401 Handler](#axios-interceptor--global-401-handler)
    - [error.response.status vs error.response.data.status](#errorresponsestatus-vs-errorresponsedatastatus)
    - [JWT vs Refresh Tokens — Where This Project Sits](#jwt-vs-refresh-tokens--where-this-project-sits)
    - [Full Code Reference](#full-code-reference)

18. [React Render Cycle, Security Model & Date Utilities — Complete Deep Dive](#18-react-render-cycle-security-model--date-utilities--complete-deep-dive)

    - [React Render Cycle — The Most Important Rule](#react-render-cycle--the-most-important-rule)
    - [useEffect — When to Use and When NOT to Use](#useeffect--when-to-use-and-when-not-to-use)
    - [window.location.href vs navigate() — Auth Guard Decision](#windowlocationhref-vs-navigate--auth-guard-decision)
    - [withAuth HOC — Partial vs Full Protection](#withauth-hoc--partial-vs-full-protection)
    - [Security Model — How the Full Protection Works](#security-model--how-the-full-protection-works)
    - [Why Route Handlers Get User Info from Middleware Not Frontend](#why-route-handlers-get-user-info-from-middleware-not-frontend)
    - [Date Formatting — new Date(), Date.now(), padStart](#date-formatting--new-date-datenow-padstart)
    - [formatDate Function — Full Breakdown](#formatdate-function--full-breakdown)

---


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

## 14. Context API & Auth Flow — Complete Deep Dive

## What is Context API and Why
 
**The problem — Prop Drilling:**
 
Without Context, passing data to deeply nested components is painful:
 
```
App → Router → AuthProvider → Routes → LandingPage → Navbar → LoginButton
// LoginButton needs handleLogin but you'd have to pass it through EVERY level as props
```
 
**Context API solution:**
 
Think of it like a **shared whiteboard** in a school classroom:
- Teacher writes data on the whiteboard once
- Any student (component) in the room can read it directly
- No need to pass a note through every student between them
```
Any component can directly grab handleLogin from the whiteboard
// No passing through every level
```
 
---
 
## createContext — Creating the Whiteboard
 
```javascript
export const AuthContext = createContext({});
```
 
- `createContext` = **creates the whiteboard** (the shared space)
- `{}` = whiteboard starts empty (default value)
- This just **creates** the whiteboard — doesn't put anything on it yet
- Any component that needs auth data will read from THIS whiteboard using `useContext(AuthContext)`
---
 
## axios.create — Pre-configured Axios Instance
 
```javascript
// Axios auto-throws on 4xx/5xx HTTP errors unlike native fetch (which requires manual res.ok check)
// Error response pre-structured as err.response.data — no manual parsing needed
const client = axios.create({
    baseURL: "http://localhost:8000/api/users"
})
```
 
`axios.create()` creates a **pre-configured axios instance** with a base URL baked in.
 
**Without it — repetitive:**
```javascript
axios.post("http://localhost:8000/api/users/register", data)
axios.post("http://localhost:8000/api/users/login", data)
// repeating the full URL every time ❌
```
 
**With it — clean:**
```javascript
client.post("/register", data)  // auto becomes localhost:8000/api/users/register ✅
client.post("/login", data)     // auto becomes localhost:8000/api/users/login ✅
```
 
`client` stores the pre-configured axios instance. You just pass the endpoint extension and axios automatically appends it to the baseURL.
 
**Why Axios over native fetch:**
 
```javascript
// Native fetch — does NOT throw on HTTP errors (4xx, 5xx)
const res = await fetch("/login");
if(!res.ok) throw new Error("failed"); // manual check required every time
 
// Axios — automatically throws on HTTP errors
const res = await axios.post("/login");
// catch block fires immediately on 4xx/5xx — no manual check needed
// error pre-structured as err.response.data.message
```
 
---
 
## AuthProvider — The Wrapper Component
 
```javascript
export const AuthProvider = ({ children }) => {
```
 
`AuthProvider` is a **functional component** that:
1. Sets up all auth logic internally (state, handlers, axios calls)
2. Puts that data on the whiteboard via `AuthContext.Provider`
3. Renders everything inside it via `{children}`
Since it's a component, you can wrap your routes with it in App.jsx:
```jsx
<AuthProvider>
    <Routes>...</Routes>
</AuthProvider>
```
 
---
 
## children — Why We Need to Render It
 
```javascript
return (
    <AuthContext.Provider value={data}>
        {children}
    </AuthContext.Provider>
)
```
 
`children` = **whatever you put between the opening and closing tags** of a component.
 
In App.jsx:
```jsx
<AuthProvider>
    <Routes>          // ← these are the children
        <Route ... />
        <Route ... />
    </Routes>
</AuthProvider>
```
 
Think of `AuthProvider` like a **transparent glass box**:
- The glass box (AuthProvider) provides auth data to everything inside it
- `{children}` = the actual content shown through the glass
**Without `{children}`:**
```jsx
return (
    <AuthContext.Provider value={data}>
        {/* nothing here */}
    </AuthContext.Provider>
)
// Routes, LandingPage, Authentication — ALL GONE from screen ❌
```
 
Your Routes ARE functional components being pointed to by `<Route element={<LandingPage/>}/>`. They need to be rendered. Without `{children}`, the wrapper swallows everything and your entire app goes blank.
 
**AuthProvider's two jobs:**
1. Put auth data on whiteboard ✅
2. Still show everything inside it via `{children}` ✅
---
 
## useContext vs useState with authContext
 
```javascript
const authContext = useContext(AuthContext); // reads current whiteboard value → {} (empty by default)
const [userData, setUserData] = useState(authContext); // initializes userData with {} as starting value
```
 
- `useContext(AuthContext)` = **reads** the whiteboard → returns `{}` (since whiteboard starts empty)
- `useState(authContext)` = initializes `userData` state with that `{}` as starting value
- `userData` starts as `{}` — just a placeholder anticipating future use (storing user profile after login)
- **Not yet used anywhere** in current code — future-proofing for features like showing username in navbar
---
 
## useState — Can it hold mixed data?
 
`useState` can hold **anything** — string, number, array, object, null:
 
```javascript
const [userData, setUserData] = useState({}); // starts as object
setUserData("hello");   // JS won't stop you, but bad practice
setUserData([1,2,3]);   // also works technically
```
 
However — **you should always keep the same type** throughout the lifecycle. If you initialize with `{}`, always `setUserData({...someObject})`. Mixing types leads to bugs when you try to access properties (e.g. `userData.name` crashes if `userData` is suddenly a string).
 
So: initialize with `{}` → always set objects. It's a convention and type consistency rule, not a hard JS restriction.
 
---
 
## Shorthand Object Syntax in data
 
```javascript
const data = { userData, setUserData, handleRegister, handleLogin };
```
 
This looks like an array but it's an **object with shorthand property syntax**:
 
```javascript
// Shorthand (what you have):
const data = { userData, setUserData, handleRegister, handleLogin };
 
// Same as writing longhand:
const data = {
    userData: userData,
    setUserData: setUserData,
    handleRegister: handleRegister,
    handleLogin: handleLogin
};
```
 
In modern JS, if key name and variable name are the same, you write it once. `{ userData }` = `{ userData: userData }`. It IS a proper key:value object — just shorthand notation.
 
---
 
## AuthContext.Provider — Writing to the Whiteboard
 
```
AuthContext          = the whiteboard (created by createContext)
AuthContext.Provider = the marker that WRITES on the whiteboard
AuthProvider         = a wrapper component that uses AuthContext.Provider internally
```
 
```javascript
return (
    <AuthContext.Provider value={data}>
        {children}
    </AuthContext.Provider>
)
```
 
`value={data}` = **writing** the data object (userData, setUserData, handleRegister, handleLogin) onto the whiteboard so every component inside can read it.
 
---
 
## Why AuthProvider not AuthContext in App.jsx
 
You COULD use `<AuthContext.Provider value={data}>` directly in App.jsx — but then you'd have to move ALL the state, handlers, axios client etc. into App.jsx. That's messy.
 
`AuthProvider` is a **clean wrapper** that hides internal complexity:
 
```jsx
// ✅ Clean — using AuthProvider in App.jsx
<AuthProvider>
    <Routes>...</Routes>
</AuthProvider>
 
// ❌ Messy — using AuthContext.Provider directly in App.jsx
// You'd have to define userData, handleRegister, handleLogin etc. all in App.jsx
<AuthContext.Provider value={{ userData, setUserData, handleRegister, handleLogin }}>
    <Routes>...</Routes>
</AuthContext.Provider>
```
 
This is the **Separation of Concerns** pattern:
- `AuthContext.jsx` = all auth logic lives here
- `App.jsx` = clean, just mounts the provider
---
 
## Why Router must be ABOVE AuthProvider
 
Think of it like **floors in a building**:
 
`useNavigate()` looks **UP** the component tree for a Router ancestor — never downward.
 
```jsx
// ✅ CORRECT — Router is ABOVE AuthProvider
<Router>              // Floor 2 — routing whiteboard EXISTS here
    <AuthProvider>    // Floor 3 — useNavigate() looks UP, finds Router on Floor 2 ✅
        <Routes/>
    </AuthProvider>
</Router>
```
 
```jsx
// ❌ WRONG — AuthProvider is ABOVE Router
<AuthProvider>        // Floor 2 — useNavigate() looks UP, finds NOTHING ❌ CRASH
    <Router>          // Floor 3 — routing whiteboard is BELOW, too late
        <Routes/>
    </Router>
</AuthProvider>
```
 
**How does useNavigate() detect Router?**
 
React Router uses Context API internally (same pattern as AuthContext!). `<Router>` puts routing info on its own internal whiteboard when it renders. `useNavigate()` reads from that routing whiteboard by looking UP the tree.
 
If Router is below AuthProvider — the routing whiteboard doesn't exist yet when `useNavigate()` tries to read it → crash.
 
**Simple rule: Router always wraps everything that needs routing.**
 
---
 
## useContext in Authentication.jsx — Reading the Whiteboard
 
```javascript
const { handleRegister, handleLogin } = React.useContext(AuthContext);
```
 
**Why destructuring from `AuthContext` and not `AuthProvider`?**
 
- `AuthProvider` is a **component** — you can't read data from a component directly
- The data lives on the **whiteboard** (`AuthContext`) via `value={data}`
- `useContext(AuthContext)` reads from the whiteboard and returns the full `data` object
- Destructuring `{ handleRegister, handleLogin }` picks only what this component needs
```
AuthProvider  = the person who wrote on the whiteboard
AuthContext   = the whiteboard itself
useContext(AuthContext) = reading from the whiteboard
```
 
---
 
## handleRegister & handleLogin Flow
 
```
User fills form → clicks button → handleAuth fires in Authentication.jsx
    │
    ▼
handleAuth calls handleRegister or handleLogin from AuthContext whiteboard
    │
    ▼
client.post makes API call to backend (userController.js handles it)
    │
    ├── Register:
    │   Server responds with 201 CREATED
    │   handleRegister returns res.data.message (plain string e.g. "User registered")
    │   Authentication.jsx receives it → setMessage → setOpen(true) → Snackbar shows ✅
    │   setFormState(0) → switches back to Login view
    │
    ├── Login:
    │   Server responds with 200 OK + token
    │   handleLogin saves token to localStorage
    │   router("/") → redirects to home page immediately
    │   (no Snackbar needed — redirect itself confirms success)
    │
    └── Error (any):
        AuthContext catches err → throws it up
        Authentication.jsx catch block receives it
        err.response?.data?.message extracted (optional chaining for safety)
        setError(message) → shown in UI below input fields
        setOpen(true) → Snackbar also shows error
```
 
---
 
## Axios vs Native fetch
 
```javascript
// Native fetch — does NOT throw on HTTP errors (4xx, 5xx)
const res = await fetch("/login");
// even 404 or 500 won't throw — you must check manually
if(!res.ok) throw new Error("failed");
const data = await res.json(); // also need to manually parse
 
// Axios — automatically throws on HTTP errors
const res = await axios.post("/login");
// 4xx/5xx auto-throws → catch block fires immediately
// response already parsed — access directly as res.data
```
 
---
 
## Complete Auth Flow — End to End
 
```
APP STARTS
─────────────────────────────────────────────
App.jsx renders:
<Router>                    ← puts routing whiteboard up
    <AuthProvider>          ← puts auth whiteboard up (userData, handleRegister, handleLogin)
        <Routes>            ← children rendered via {children}
            <Route path="/" element={<LandingPage/>} />
            <Route path="/auth" element={<Authentication/>} />
        </Routes>
    </AuthProvider>
</Router>
 
─────────────────────────────────────────────
USER VISITS /auth → Authentication.jsx renders
─────────────────────────────────────────────
const { handleRegister, handleLogin } = useContext(AuthContext)
// reads handleRegister and handleLogin from auth whiteboard
 
─────────────────────────────────────────────
REGISTER FLOW
─────────────────────────────────────────────
User fills name, username, password → clicks Register
    │
    ▼
handleAuth → formState === 1 → calls handleRegister(name, username, password)
    │
    ▼
client.post("/register", { name, username, password })
→ POST http://localhost:8000/api/users/register
    │
    ▼
Backend: bcrypt hashes password → saves new User to MongoDB
→ res.status(201).json({ message: "User registered" })
    │
    ▼
handleRegister returns "User registered" (plain string)
    │
    ▼
Authentication.jsx:
setMessage("User registered") → setOpen(true) → Snackbar shows for 4 seconds
setFormState(0) → switches to Login view
fields cleared
 
─────────────────────────────────────────────
LOGIN FLOW
─────────────────────────────────────────────
User fills username, password → clicks Login
    │
    ▼
handleAuth → formState === 0 → setError('') → calls handleLogin(username, password)
    │
    ▼
client.post("/login", { username, password })
→ POST http://localhost:8000/api/users/login
    │
    ▼
Backend: bcrypt.compare → generates token → saves to DB
→ res.status(200).json({ token: "a3f8c2d1..." })
    │
    ▼
handleLogin:
localStorage.setItem("token", token) → token persisted in browser
router("/") → immediate redirect to LandingPage (home)
 
─────────────────────────────────────────────
ERROR FLOW
─────────────────────────────────────────────
Any API error → Axios auto-throws
    │
    ▼
AuthContext catch block:
console.error(err)
throw err → bubbles up to Authentication.jsx
    │
    ▼
Authentication.jsx catch block:
err.response?.data?.message || 'Something went wrong'
setError(message) → shown below input fields in red
setOpen(true) → Snackbar also shows
```
 
---

## 15. STUN Server

### What is it?

STUN Servers are lightweight servers which run on the public internet and return the public IP of the requester's device.

That's the whole job. No video, no chat, no auth — just one thing: "Hey, what's my public IP and port, from your point of view?"

### The problem it solves

When your laptop connects to WiFi at home, your router gives it a **private IP** like `192.168.1.5`. That IP only makes sense *inside* your home network — nobody on the internet can use it to reach you directly.

To everyone outside, your whole house looks like ONE public IP (e.g. `103.21.58.10`) — the one your ISP gave your router. This swap (private IP → public IP) is called **NAT (Network Address Translation)**.

**Important: this swap happens automatically, for EVERY single thing you do online** — opening Google, watching YouTube, all of it. It has nothing to do with STUN. STUN doesn't trigger this swap or cause it to happen — it's already happening in the background, all the time, for all your traffic.

> Think of your router like a hotel's front desk. Every room (device) has its own room number (private IP), but to the outside world, only the hotel's street address is visible. The front desk re-stamps every outgoing letter with the hotel's address before it leaves — automatically, for every guest, every time.

### Common confusion: does STUN "find" the public IP and then "assign" it to you?

No — and this trips almost everyone up the first time, so let's be precise.

**What does NOT happen:**
~~private IP → STUN gets called → STUN looks up the public IP → STUN assigns it to your device~~

**What ACTUALLY happens:**

1. Your router is *already* swapping your private IP for its public IP on every packet you send — this was true before you ever heard of STUN.
2. You send a tiny request to the STUN server. As that request leaves your house, your router does its usual automatic swap (step 1) — nothing special happens because the destination is a STUN server.
3. The STUN server receives the request and simply looks at "what address did this packet arrive from?" — which is now your public IP:port, because the router already rewrote it.
4. The STUN server writes that address into its reply and sends it back: "I see you as `103.21.58.10:54321`."

So STUN isn't *creating* or *assigning* your public IP — it's just **reporting back** something that already happened, because you yourself have no way to see your own packet from the outside.

> Analogy: it's like calling a friend and asking "hey, what number did your caller ID show when I rang you?" You're not creating a new phone number by asking — you're just finding out what the phone network already assigned you, because YOUR phone can't see its own caller ID from your friend's side.

### Wait — if everyone on my home WiFi shares one public IP, how does the router know which device gets which reply?

Great question, and the answer is: **the public IP is shared, but the PORT is not.**

Extend the hotel analogy: every guest shares the same hotel street address, but when a guest makes a phone call, the front desk gives that call a unique **extension number**. When a return call comes in for "extension 504," the front desk's logbook says "that's Room 12" and routes it there. Fifty guests can be on fifty different calls at the same time, through the same single hotel address, because of the extensions.

Your router does the exact same thing with ports:

| Device | What the outside world sees |
|---|---|
| Your phone | `103.21.58.10:54321` |
| Your laptop | `103.21.58.10:60010` |
| Your smart TV | `103.21.58.10:51112` |

Same public IP, different ports. Your router keeps an internal table mapping each port back to the correct device, so return traffic always lands in the right place. This is exactly why STUN's reply includes a **port number, not just an IP** — the full `ip:port` pair is what uniquely identifies your specific connection.

### Will my video-meet project fail behind a corporate firewall or on certain mobile networks?

Honestly — possibly yes, and that's not a flaw in your code. It's a known limitation that even Zoom, Google Meet, and Discord have to work around. Two specific reasons:

**1. Corporate firewalls**
Many companies deliberately block this kind of address-discovery traffic for security reasons (it's UDP traffic, and security teams are cautious about UDP). On top of that, some corporate networks use a stricter type of NAT called **symmetric NAT**, which hands out a *different* external port every time you contact a *different* destination. That breaks STUN's trick — the port STUN saw was only valid for talking to the STUN server itself, not for talking to your actual call partner.

**2. Certain mobile carriers (CGNAT)**
To save on the limited number of available IPv4 addresses, many mobile carriers put hundreds or thousands of customers behind a **single shared public IP**, using something called **Carrier-Grade NAT (CGNAT)** — an extra layer of NAT done by the carrier, completely outside your control. This often behaves like the symmetric NAT case above, breaking direct peer-to-peer connections the same way.

**The fix in both cases:** fall back to a **TURN server**. Instead of trying to make a direct connection at all, a TURN server acts as a permanent, always-reachable middleman — both peers send their video/audio to it, and it forwards the traffic between them. Slower (extra hop), but it always works, no matter how strict the network is.

This is completely normal, by the way — it's not a sign you did something wrong. For a portfolio project, it's totally fine to ship with just STUN and note "TURN server fallback" as a planned next step in your README. Saying that out loud in an interview actually signals that you understand NAT traversal properly, not just that you copy-pasted a config object.

### Where you'll see it in code

\`\`\`js
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
\`\`\`

This gets passed into `RTCPeerConnection` as part of WebRTC's **ICE** (Interactive Connectivity Establishment) process — the negotiation phase where two peers figure out the best way to reach each other.

### Quick recap

| | STUN | TURN |
|---|---|---|
| Job | Discovers your public IP:port | Relays the actual media |
| Cost | Free, lightweight | Needs bandwidth, usually paid |
| Used when | A direct P2P connection is possible | NAT/firewall blocks direct connection |

### One-liner for interviews

> "STUN doesn't assign anything — it just reports back the public IP:port that NAT already gave your device, so two peers can try a direct connection. If the network blocks that (corporate firewalls, CGNAT on mobile), a TURN server relays the media instead."

---

## 15. STUN Server & TURN Server — Complete Deep Dive

### What is a Firewall?

A **firewall** is a security gatekeeper (software or hardware) that inspects network traffic going in and out, and decides — based on rules — what's allowed and what's blocked. It's a completely different job from NAT (Network Address Translation): NAT *translates* addresses, a firewall *filters/blocks* traffic. In practice, the same physical box (your office's router/gateway) usually does both jobs at once, which is why they get mentioned together.

### Need of STUN Server

When your laptop connects to home WiFi, your router gives it a **private IP** like `192.168.1.5` — only meaningful *inside* your house. To the outside world, your whole house looks like ONE **public IP** (e.g. `103.21.58.10`) — the one your ISP gave your router. This automatic swap is **NAT (Network Address Translation)**, and it happens for everything you do online, STUN or not.

For two people to video call **directly** (peer-to-peer — the whole point of WebRTC), each device needs to tell the other "send packets to THIS address." Your device only knows its private IP — useless to anyone outside your house.

**STUN (Session Traversal Utilities for NAT)** is a lightweight server that returns the public IP of whoever asks it. Your request to STUN passes through your router first (NAT swap happens automatically), so STUN only ever sees your public IP:port, and echoes it back. STUN doesn't *create* or *assign* anything — it just reports what your router already did, since you can't see that from the inside yourself.

> Analogy: like calling a friend and asking "what number did your caller ID show when I called you?" You're not creating a number — just learning what the outside world already sees.

### Drawback of STUN Server

STUN works on simple home networks but breaks in two real situations:

**1. Corporate/strict firewalls.** Many offices use a stricter NAT type called **symmetric NAT**. Here's exactly how it works, and where the common confusion is: it's **not about timing** (the port doesn't change *while* you're mid-conversation with STUN). It's about being **per-destination**. Symmetric NAT assigns a *different* external port for *every different destination* you talk to — even from the exact same internal port, at the exact same time.

> Example: your phone uses internal port `50000` for everything. When it talks to the STUN server, symmetric NAT maps it to external port `62345`. When that SAME phone, from that SAME internal port `50000`, talks to a totally different destination (your actual call partner), symmetric NAT assigns a DIFFERENT external port, say `71234`, for THAT destination. The `62345` that STUN reported back to you was only ever valid for talking to STUN — useless for anyone else.

> Real analogy: imagine you have one phone, but the phone company gives you a different caller-ID number every time you call a different person. You tell STUN "call me back at 555-1234" — but the moment you call your actual friend, your outgoing number becomes 555-5678 instead. Your friend has no way to use the number STUN gave you.

Why do offices configure things this way? Not really to "hide" their public IP (that's already visible to any website you visit anyway) — it's mainly about **preventing outside devices from initiating connections INTO internal machines**, a real security concern. Symmetric NAT + strict firewall rules make it very hard for an external party — even one who has your address — to open a connection back to you, which is exactly the security posture IT departments want, and exactly what breaks P2P calling as a side effect.

**2. Mobile carriers (CGNAT).** To deal with there not being enough IPv4 addresses for every phone on Earth (~4.3 billion total addresses exist, already mostly allocated), carriers put thousands of customers behind ONE shared public IP using **CGNAT (Carrier-Grade NAT)** — an extra NAT layer run by the carrier, completely outside your control.

You correctly pointed out: different customers still get different *ports*, so sharing one IP alone isn't inherently broken — same as your home WiFi example. **The real issue is that CGNAT commonly also behaves like symmetric NAT** (same per-destination problem as the corporate firewall case above), for similar security/abuse-prevention reasons at a much bigger scale. There's also a secondary, CGNAT-specific issue: each public IP only has about 65,000 total ports available, and when an ISP crams thousands of customers behind it, each customer might only get a small slice of that — leading to **port exhaustion** issues on top of the symmetric-NAT problem.

**Real-world example:** virtually any phone on regular 4G/5G mobile data, in most countries today, is behind some form of CGNAT — there simply aren't enough IPv4 addresses for every phone to have its own.

**Who decides a device's port, by the way?** Your device's OS automatically picks an "ephemeral port" (usually from a large pool like 49152–65535) every time an app opens an outgoing connection — you/the browser never choose it manually. Separately, the NAT router/gateway decides what *external* port to map that internal port to — that's the router's job, not yours.

**Does a device's public IP/port change constantly, in general?** No — for *most* simple home/basic NAT setups (called "Full Cone" or "Restricted Cone" NAT), your external IP:port mapping stays the same regardless of which destination you talk to, as long as the mapping hasn't timed out from inactivity (timeouts are usually several minutes). It's specifically **symmetric NAT** (common in strict corporate networks and CGNAT) that changes the port *per destination* — that's the specific behavior that breaks STUN, not some general instability of IPs/ports everywhere.

In both broken cases, STUN simply cannot produce a usable address. You need a fundamentally different solution — not a better STUN trick.

### What is TURN Server and How It Helps

**TURN (Traversal Using Relays around NAT)** is a permanent, always-reachable middleman server. Instead of trying a direct connection at all, both peers send their video/audio TO the TURN server, and it forwards traffic between them.

> Analogy: instead of calling your friend directly, you both dial into the same conference bridge number, and the bridge patches your lines together. The bridge does real work (your data physically passes through it) — slower, costs bandwidth — but works regardless of how strict the network is.

TURN never inspects or stores your video — it just forwards each packet immediately, like a relay runner handing off a baton without looking at it.

**Practical notes worth remembering:** TURN credentials are typically requested for a limited **TTL (Time To Live)** — we used 6 hours (21600 seconds) as a safe buffer, since most video calls realistically last 10–60 minutes, so this comfortably covers even long sessions without needing mid-call renewal. Also: Turnix's free tier gives **10GB of TURN bandwidth per month** — plenty for a portfolio project's worth of testing and demos.

### What is an ICE Candidate, Exactly?

You asked directly: is a "candidate" a peer, or a server? **Neither — it's a small piece of data.**

An **ICE (Interactive Connectivity Establishment) candidate** is just **one possible address (IP + port) + a label of what type it is** (host / srflx / relay) that a peer offers as "here's one way you could try reaching me." Each peer generates *several* candidates for itself (one host, one srflx from STUN, one relay from TURN — sometimes more) and shares *all* of them with the other side. The other side then tries each one until something connects.

So: not a peer, not a server — just an address option, discovered with the *help* of STUN/TURN servers, then shared via signaling.

### The Flow — Host → STUN → TURN

**1. Host candidate — no server involved at all**
Your device's own local IP, reported directly by your OS. No STUN, no TURN — you already know it.

**Your sharp catch, addressed directly:** *"Wouldn't two devices on the same WiFi still get the same public IP + different ports — shouldn't that be STUN, not host?"* Good instinct, but here's the key distinction: **host candidates use PRIVATE IPs, which only work for direct device-to-device communication on the SAME local network — completely bypassing the internet and NAT entirely.** Two devices on the same WiFi each have their OWN distinct private IP (e.g. `192.168.1.5` and `192.168.1.8`) and can talk to each other directly over the local network, with zero NAT translation involved at all — local-network traffic between devices on the same subnet never needs to leave the router to reach the public internet and come back.

This is genuinely different from srflx, which uses the *public-facing* address (after NAT) — looping back out to the internet and (sometimes) back in, which not all routers even support properly (called "NAT hairpinning"). Host is tried first specifically because it's faster and doesn't depend on that hairpinning support.

> Analogy: "host" is like walking down the office hallway and knocking on a colleague's door using their internal room number — you never go through the city's phone network at all, because you're already in the same building.

**2. Server-reflexive (srflx) candidate — from STUN ("server-reflexive" just means "what a server reflected back to me about myself")**
If you're on different networks, this is the public IP:port STUN found for you. Still a TRUE direct peer-to-peer connection — STUN only helped find the address, no server touches the actual video.

> Analogy: you don't know your friend's outside phone number, so you ask the building receptionist (STUN), "what's my outside number?" — then you call your friend directly using that number.

**3. Relay candidate — from TURN, last resort**
Only used if neither of the above can connect.

> Analogy: the phone systems can't connect you directly at all, so you both dial into a conference bridge (TURN) that patches the call through.

**Note:** the browser tries these in priority order (host > srflx > relay) regardless of array order in your `iceServers` config — array order is just "the pool available," not a sequence.

### Signaling Server vs STUN/TURN — The Corrected Full Flow

You proposed: *"offer → socket server → TURN server → Client B"* — **this part is incorrect, and worth fixing precisely**, because it's a common and important misunderstanding.

**The offer/answer (signaling) NEVER passes through TURN. Ever.** TURN is contacted at two completely separate moments, both DIRECT client-to-TURN exchanges — neither one goes through your Socket.io server:

**Moment A — Gathering a relay candidate (before signaling even sends anything):**
Client A directly asks the TURN server (using credentials your backend issued) "give me a relay address I can use." TURN replies with an address. This is a direct A↔TURN exchange.

**Moment B — Actually relaying media (only if relay ends up being selected later):**
If, after trying all candidates, relay turns out to be what works, THEN real audio/video starts flowing: Client A → TURN → Client B, and Client B → TURN → Client A. Also a direct exchange, never touching Socket.io.

**What actually goes through Socket.io (signaling), the whole time:**
- Client A's SDP offer (+ all of A's gathered candidates: host, srflx, AND the relay address from Moment A)
- Client B's SDP answer (+ all of B's gathered candidates)

That's it. Socket.io carries small text messages (addresses and session info) — never the actual relay address *traffic*, never real audio/video. The relay candidate's *address* travels through signaling like any other candidate; but TURN as a *server* is only ever talked to directly by each client, never through Socket.io.

**Your other question — "if the socket server already sees my public IP, why bother with STUN at all?"** Great instinct, and here's the precise answer: the signaling connection (your WebSocket/Socket.io connection) and the actual media connection (WebRTC, almost always **UDP — User Datagram Protocol**) are **two completely separate network connections**, using different protocols and, crucially, different ports. NAT assigns ports per-connection, not per-device — so even though the signaling server *can* see your IP and the port used for *that* TCP (Transmission Control Protocol) connection, that's not the same port that gets mapped for your *separate* UDP media connection. STUN has to run fresh, specifically for the media path, because the signaling server's view simply isn't reusable for it.

### SDP vs ICE Candidates — Two Different Things

You bundled these together in your question, which is an easy mix-up — they're related but distinct pieces of data, both sent via signaling:

- **SDP (Session Description Protocol)** — describes the *media session itself*: what codecs are supported (e.g. VP8/H264 for video, Opus for audio — your "zip format" comparison is a fair mental model, codecs compress/encode media efficiently, similar in spirit to how zip compresses files), media types, and other session parameters. **No addresses here.**
- **ICE candidates** — separate pieces of data describing *possible network paths* (the host/srflx/relay addresses). **No codec info here.**

Both travel through signaling (sometimes bundled together, sometimes sent separately as they're discovered — called "trickle ICE"), but they answer two different questions: SDP = "what kind of media, encoded how," ICE candidates = "where to send it."

### Does TURN Change the Mesh Architecture?

You asked, and you're right: **no, it doesn't.** Your project uses a mesh architecture (no SFU) — every peer sends a *separate* copy of its stream directly to each of the other N-1 participants. TURN doesn't reduce this multiplication; it just adds a relay hop to whichever *specific pairs* need it.

> Example: if Participant C is behind a strict firewall in a 3-person call, C still sends 2 separate upload streams — one routed via TURN to reach A, another via TURN to reach B. TURN solves *connectivity*, not *scaling* — that distinction is exactly why TURN ≠ SFU (covered earlier in these notes). And yes, your instinct about latency is correct — an extra hop through a relay server, physically located somewhere else, does add some latency compared to a true direct connection.

### The .json() Confusion — Fully Cleared

Two different methods sharing the name `.json()`, doing **opposite jobs**, on **different objects**:

| | What it is | Exists on | Direction |
|---|---|---|---|
| `res.json(data)` | Express-specific method | Only Express's `res` (response) object | JS value **→** JSON text (serializes + sends) |
| `response.json()` | Fetch-API-specific method | Only a `Response` object from `fetch()` | JSON text **→** JS value (parses) |

Plain objects/arrays do **not** have a `.json()` method — `someArray.json()` crashes with `TypeError`.

The real, universal converters — work on ANY value:
```js
JSON.stringify(anyValue)  // JS value → JSON text
JSON.parse(jsonText)      // JSON text → JS value
```
`res.json(data)` is shorthand for: `JSON.stringify(data)` + set `Content-Type: application/json` header + send it.

**Axios** auto-detects JSON responses and parses them internally — that's why `response.data` works with zero manual `.json()` call, unlike raw `fetch()`.

**⚠️ Be cautious — `response.json()` can throw a parsing error.** `fetch()` doesn't know in advance whether the body it received is actually valid JSON. If your backend crashes *before* reaching `res.json(...)` — say, an unhandled error causes Express to send back its default HTML error page instead — your frontend's `await response.json()` will throw something like `SyntaxError: Unexpected token < in JSON at position 0` (because it tried to parse `<!DOCTYPE html>...` as JSON). This is exactly why `getIceServers()` wraps the whole fetch in a `try/catch` — so a malformed or unexpected response doesn't crash your app, it just falls back to STUN-only instead.

> **Critical note:** Express route handlers do **NOT** use the JS `return` keyword to send HTTP responses. Whatever you `return` from a route handler is ignored for networking purposes. Only `res.send()`, `res.json()`, or `res.end()` actually transmit data back. `return someData;` alone sends nothing.

### cachedIceServers & ensureIceServers Explained

```javascript
let cachedIceServers = null;

async function ensureIceServers() {
  if (!cachedIceServers) {
    cachedIceServers = await getIceServers(); // only runs the FIRST time
  }
  return cachedIceServers; // every other time, instant return, no network call
}
```

Exact trigger, every call: **"Is `cachedIceServers` still `null`?"** First call → fetch happens, gets stored. Every call after → skipped, cached value returned instantly. Resets only on a full page reload.

**What it skips vs doesn't skip:** only skips re-asking *your own backend* for the server list/credentials. Every new `RTCPeerConnection` (one per peer pair, in your mesh setup) still independently gathers its OWN fresh host/srflx/relay candidates using that shared list. Same toolbox handed to everyone; each connection decides for itself what it needs.

### Frontend .env vs Backend .env — Security Note

Worth recording clearly, since you summarized it well yourself:

- **Frontend `.env` (Vite, accessed via `import.meta.env`)**: keeping it out of `.gitignore`'d-out of GitHub only protects it from being *publicly visible in your repo*. It does **NOT** protect it in production — anything `VITE_`-prefixed gets bundled directly into the JavaScript shipped to every visitor's browser, fully readable via DevTools → Network/Sources tab. Safe for non-secret config (like a backend URL), unsafe for anything sensitive.
- **Backend `.env`**: genuinely safe — these values live only on your server, are never sent to the browser, and never leave your machine/host. This is where real secrets (API tokens, bearer tokens) must live.

### Full Code Reference

**Frontend (`VideoMeet.jsx`):**
```javascript
async function getIceServers() {
  const stun = { urls: "stun:stun.l.google.com:19302" };
  try {
    const response = await fetch(`${SERVER_URL}/api/turn/credentials`);
    const iceServers = await response.json();
    return iceServers;
    // or: return [stun, ...iceServers]; — to also keep Google's STUN as redundancy
  } catch (err) {
    console.error("Couldn't fetch TURN credentials, falling back to STUN only:", err);
    return [stun];
  }
}

let cachedIceServers = null;
async function ensureIceServers() {
  if (!cachedIceServers) {
    cachedIceServers = await getIceServers();
  }
  return cachedIceServers;
}

// Usage, wherever a peer connection gets created:
const iceServers = await ensureIceServers();
const peerConnection = new RTCPeerConnection({ iceServers });
```

**Backend (`routes/turnRoutes.js`):**
```javascript
import express from "express";
import { TurnixIO } from "turnix-js";

const router = express.Router();
const turnix = new TurnixIO({ bearerToken: process.env.TURNIX_API_TOKEN });

router.get("/credentials", async (req, res) => {
  try {
    const iceServers = await turnix.requestCredentials({ ttl: 21600 }); // 6 hours
    res.json(iceServers);
  } catch (err) {
    console.error("Failed to generate TURN credentials:", err);
    res.status(500).json({ error: "Could not generate TURN credentials" });
  }
});

export default router;
```

**Mounted in main server file:**
```javascript
import turnRoutes from "./routes/turnRoutes.js";
app.use("/api/turn", turnRoutes); // combined = /api/turn/credentials
```

**`backend/.env`:**
```dotenv
TURNIX_API_TOKEN=your_bearer_token_here
```

### How to Verify TURN Is Actually Working

**1. Trickle-ICE tester:** `webrtc.github.io/samples/src/content/peerconnection/trickle-ice/` — paste TURN URL/username/credential, Gather candidates, look for a `relay` row.

**2. Force TURN-only in your real app (definitive proof):**
```javascript
const peerConnection = new RTCPeerConnection({
  iceServers,
  iceTransportPolicy: "relay", // TEMPORARY — remove after testing
});
```

**3. Live call check:** `chrome://webrtc-internals` during an active call — check the selected candidate pair's `candidateType`.

### Entire Flow — Putting It All Together (Corrected)

1. User joins → frontend calls `ensureIceServers()` → backend asks Turnix for fresh credentials (secret bearer token, server-side only) → array returned.
2. `new RTCPeerConnection({ iceServers })` created.
3. Browser gathers candidates: host (instant), srflx (direct request to STUN), relay (**direct** request to TURN — NOT through signaling).
4. Client A builds an SDP offer (codec info) + attaches all its gathered candidates (host, srflx, relay address).
5. **Signaling (Socket.io) delivers** this offer + candidates to Client B — pure text, no media, no TURN involvement at this step.
6. Client B does the same in reverse: gathers its own candidates, builds an SDP answer, sends offer+candidates back via Socket.io.
7. Both sides now try connecting using each other's candidates: host first, then srflx, then relay.
8. Whichever pairing connects first wins. If it's relay: **only now** does actual media start flowing, directly between each client and the TURN server (still never through Socket.io).
9. New peer joins → a separate `RTCPeerConnection` is created for that pair → reuses cached credentials (no new backend call) → repeats steps 3–8 independently for that pair only.

### Edge Case: TTL Expiry for Existing Long-Running Calls

TURN credentials have a TTL (Time To Live) — we used 6 hours. What happens if a call genuinely outlasts that?

**For a NEW peer joining after the TTL window:** with the simple caching approach (`cachedIceServers`, fetched once per page load), a new joiner would be handed stale, expired credentials — if TURN is needed for them, it would fail.

**For an EXISTING, already-connected call still running past the TTL:** the browser automatically keeps a relay allocation alive by sending small "refresh" requests every few minutes, reusing the original credential. As long as those keep succeeding, the call keeps working. But once the credential's TTL is genuinely exceeded, the next refresh attempt fails to authenticate — meaning a call that truly outlasts its TTL risks its relay path breaking mid-call.

**The production-ready fix (NOT needed for this project, but worth knowing for an interview):** an auto-renewal job — proactively fetch fresh credentials *before* the TTL runs out, then call `peerConnection.setConfiguration({ iceServers: newOnes })` on the *existing* connection, followed by `peerConnection.restartIce()` to renegotiate using the new credentials without dropping the call.

**Why this isn't worth building here:** this is genuinely advanced WebRTC engineering, and realistic demo/portfolio calls last minutes, never hours — there's essentially zero chance of ever hitting this in practice. The simple, sufficient fix for a project like this is just setting a generous TTL (e.g. 24 hours instead of 6) as a one-line safety margin. The auto-renewal job is good to *understand and be able to explain*, not something that needs to exist in the code.

### Edge Case: Asymmetric NAT — When Only One Peer Needs Relay

**Important correction to a common assumption:** every peer gathers ALL THREE candidate types — host, srflx, AND relay — every single time, regardless of whether it'll end up needing them. This is just standard ICE gathering: everyone uses the same `iceServers` toolbox (STUN + TURN), so everyone requests a relay candidate as a backup option, "just in case."

**Scenario:** Client A is on normal home WiFi (fully reachable). Client B is behind a strict corporate firewall (host fails, srflx fails due to symmetric NAT — only B's relay candidate actually works).

**What happens during connectivity checks:** ICE tests every possible PAIR (one candidate from A × one candidate from B). A's host/srflx paired with B's host/srflx — fails, B isn't reachable that way. A's host/srflx paired with **B's relay** — succeeds. That becomes the one winning, validated pair for this connection.

**Here's the key nuance:** A *also* gathered its own relay candidate (same as everyone), but it never gets selected — because A's real (srflx) address already validates successfully on its own, and ICE always prefers the cheapest working option. A's relay candidate just sits there unused, not because A "doesn't have one," but because nothing ever needed it.


**The resulting flow:**

```
CLIENT A → CLIENT B's relay address (the only way to reach B) → forwarded → CLIENT B
CLIENT B → CLIENT B's OWN relay (the one reliable channel B has) → "forward this to A" → relay sends it → directly to CLIENT A's real, reachable address (public ip:port)
```

Both directions of B's traffic route through **B's single relay** — not because each side has a separate relay the other uses symmetrically, but because B's relay is B's *only* proven-reliable channel, used for both sending and receiving. A, meanwhile, never touches a relay at all for its own traffic — it communicates via its real address throughout.

**This only becomes fully symmetric (each side using the other's separate relay) if BOTH peers are behind restrictive networks** — then yes, each would have their own relay, and each would send to the other's relay address. With only one restricted peer, only one relay is ever actually used, for both directions of that peer's traffic.

---

## 16. React & JS Gotchas — VideoMeet Specific

### React State Setter is Async — The Most Common Trap

This is the single most common mistake beginners make in React, and it will
bite you repeatedly across this whole project if you don't lock it in now.

When you call a setter like `setVideoAvailable(true)`, React does NOT update
`videoAvailable` immediately. React **schedules** the update and applies it
on the next render cycle — which happens asynchronously, sometime after your
current function finishes running.

So this code is broken, even though it looks perfectly reasonable:

```javascript
// ❌ WRONG
setVideoAvailable(true);
if (videoAvailable) {
  // videoAvailable is STILL false here — the setter ran, but the value
  // hasn't updated yet. This if block will never execute.
}
```

**The fix: use a local variable for same-function logic. Use the setter
only to update what React displays on screen.**

```javascript
// ✅ CORRECT
let isVideoAvailable = true;       // local variable — updates instantly
setVideoAvailable(isVideoAvailable); // tells React to update the UI display
if (isVideoAvailable) {            // reads the local variable, not the state
  // this works correctly
}
```

Two separate jobs:
- **Local variable** = for logic happening inside this function right now
- **State setter** = for telling React to re-render the UI with the new value

---

### async/await vs React State — Why You Can't await a Setter

You might wonder: "if setters are async, can't I just await them?"

No — and this is an important distinction.

`async/await` in JavaScript only works with things that return a **Promise**
— a special object that says "I'll give you a value later, you can wait for
me." Examples that return Promises:
- `fetch()` — waiting for a network response
- `navigator.mediaDevices.getUserMedia()` — waiting for camera/mic access
- Database queries — waiting for data from a database

React's setter functions (`setVideo`, `setAudio`, `setVideoAvailable` etc.)
do **NOT** return a Promise. They return `undefined`. There is nothing to
await.

```javascript
await setVideoAvailable(true);
// ❌ This compiles without errors but does absolutely nothing useful.
// await on undefined just continues immediately — same as not having await.
// videoAvailable is STILL the old value after this line.
```

React manages its own internal update scheduler that is completely separate
from JavaScript's Promise/await system. They are two different async
mechanisms that don't interact with each other at all.

**Simple rule to remember:**
- `await` = works only on Promises
- React state setters = never return Promises
- Therefore: `await` on a setter = useless, always

---

### !! Double Bang — Existence Check Shorthand

In JavaScript, every single value — whether it's a number, string, function,
object, `undefined`, anything — can be evaluated as either "yes" or "no"
in a boolean context. This is called **truthy/falsy**:

**Falsy values** (count as "no"): `false`, `0`, `""`, `null`, `undefined`, `NaN`
**Truthy values** (count as "yes"): literally everything else — including
functions, objects, arrays, and even the number `42`

The single `!` operator flips a value to its opposite boolean:
```javascript
!true         // → false
!false        // → true
!undefined    // → true  (undefined is falsy, flip it → true)
!function(){} // → false (a function exists = truthy, flip it → false)
```

The double `!!` flips it twice — net result: you get a clean `true` or
`false` representing whether something exists:

```javascript
// Step by step for !!undefined:
// undefined is falsy
// !undefined → true (flipped once)
// !!undefined → false (flipped back)
// result: false — "this thing doesn't exist"

// Step by step for !!function(){}:
// a function is truthy (it exists)
// !function(){} → false (flipped once)
// !!function(){} → true (flipped back)
// result: true — "this thing exists"
```

In your code:
```javascript
setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
```

- Chrome/Firefox (supports screen share): `getDisplayMedia` is a real
  function → truthy → `!!` → `true`
- Old browser (no support): `getDisplayMedia` is `undefined` → falsy →
  `!!` → `false`

This controls whether the Share Screen button shows in your UI at all.
No point showing a button that can never work.

---

### navigator — The Browser's Hardware Gateway

`navigator` is a built-in browser object that gives you access to
information about the browser itself and the device's hardware.

```javascript
navigator.mediaDevices          // access to camera, microphone, screen sharing
navigator.mediaDevices.getUserMedia()    // request camera and/or microphone
navigator.mediaDevices.getDisplayMedia() // request screen sharing
navigator.onLine                // is the device currently online?
navigator.language              // user's browser language ("en-US" etc.)
```

`getUserMedia()` and `getDisplayMedia()` don't just "turn on" your camera
or screen — they first show the browser's **permission prompt** to the user
("This site wants to use your camera"), wait for the user's response, and
only then either give you a stream (if allowed) or throw an error (if denied).

---

### MediaStream & Tracks — What They Actually Are

When `getUserMedia()` succeeds, it gives you back a **MediaStream** object.
Think of it as a container/bag that holds one or more live data flows.

Each individual data flow inside that bag is called a **MediaStreamTrack**.
One track = one type of media. Always either video OR audio, never both
in a single track.

```javascript
// When you request both video and audio:
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

// stream is a MediaStream containing TWO tracks:
stream.getTracks()       // → [videoTrack, audioTrack]
stream.getVideoTracks()  // → [videoTrack] only
stream.getAudioTracks()  // → [audioTrack] only
```

What a MediaStreamTrack looks like (simplified):
```javascript
MediaStreamTrack {
  kind: "video",              // or "audio"
  label: "Built-in Camera",  // human-readable device name
  enabled: true,              // is it currently transmitting?
  readyState: "live",         // "live" or "ended"
  // + continuous raw binary data flowing through it
}
```

---

### track.stop() vs track.enabled — Two Very Different Things

This distinction matters a lot for toggle buttons (mute/unmute,
camera on/off). They look similar but do completely different things:

| | `track.stop()` | `track.enabled = false` |
|---|---|---|
| What it does | Permanently kills the track | Pauses it, keeps it alive |
| Camera light | Goes off | Usually stays on |
| To turn back on | Need a completely new `getUserMedia()` call | Just set `track.enabled = true` |
| Use for | End call / leave meeting | Mute/unmute toggle buttons |

```javascript
// Permanently stop — use when leaving call
stream.getTracks().forEach(track => track.stop());

// Temporarily mute audio — use for mute button
stream.getAudioTracks().forEach(track => track.enabled = false);

// Unmute — instant, no new getUserMedia needed
stream.getAudioTracks().forEach(track => track.enabled = true);

// Turn off camera — use for camera toggle button
stream.getVideoTracks().forEach(track => track.enabled = false);
```

**Real-world analogy:**
- `track.stop()` = unplugging your microphone from the wall
- `track.enabled = false` = putting your hand over the microphone

One is permanent hardware release. The other is a soft pause you can
instantly undo.

---

### window.localStream — Why Global

After `getUserMedia()` gives you the user's camera+mic stream, you need
to store it somewhere that's accessible from **anywhere** in your app —
not just inside the function that originally got it.

```javascript
window.localStream = userMediaStream;
```

Storing it on the global `window` object means any other function anywhere
in your app can read it. This matters specifically because WebRTC peer
connection setup (adding your stream to a connection so the other person
can see/hear you) happens inside **socket event callbacks** — functions
that run at a completely different time, triggered by the server, with no
access to local variables from `getPermissions()` which finished long ago.

```javascript
// Inside a socket event handler (runs later, triggered by server):
connections[socketListId].addStream(window.localStream); // ✅ works
connections[socketListId].addStream(userMediaStream);    // ❌ userMediaStream
                                                          // is out of scope here
```

**Is this the same as a global variable?** Almost, yes. A module-level
`let localStream = null` declared outside the component would also work.
`window.localStream` is slightly more universal (accessible even from the
browser console for debugging) but conceptually the same idea — a place
to store something that outlives any individual function call.

---

### getUserMedia — Why Two Separate Calls

Inside `getPermissions()`, `getUserMedia` is called three times total, and
it's confusing why. Here's the precise reason for each:

**Call 1 — permission check only (video):**
```javascript
await navigator.mediaDevices.getUserMedia({ video: true });
isVideoAvailable = true;
```
Just knocking on the door. The stream returned here is **immediately
thrown away** — we only care whether it threw an error or not. If it
didn't throw, permission was granted.

**Call 2 — permission check only (audio):**
```javascript
await navigator.mediaDevices.getUserMedia({ audio: true });
isAudioAvailable = true;
```
Same — purely checking. Result discarded.

**Call 3 — the real stream (video + audio combined):**
```javascript
const userMediaStream = await navigator.mediaDevices.getUserMedia({
  video: isVideoAvailable,
  audio: isAudioAvailable,
});
window.localStream = userMediaStream; // THIS one gets kept and used
```
This is the actual stream we use — one combined stream with both tracks
together. Stored globally, shown in the lobby video element, later added
to peer connections.

**Why not just use the result from Call 1 and Call 2?**
Because they were separate — one video-only, one audio-only. You need
a single combined stream. Also, the permission prompts may have been
dismissed by then. The third call gets a clean, combined, ready-to-use
stream.

---

### getUserMedia Toggle Logic — Why Only Two Branches Needed

When a user toggles video or audio on/off during a live call, you might
think you need separate cases for every combination. You don't — because
`getUserMedia` already handles all combinations based on what you pass it:

```javascript
{ video: true,  audio: true  } // → stream with both tracks
{ video: false, audio: true  } // → stream with audio track only
{ video: true,  audio: false } // → stream with video track only
{ video: false, audio: false } // → this case = no stream needed at all
```

So you only need two branches:

```javascript
let getUserMedia = () => {
  if ((video && videoAvailable) || (audio && audioAvailable)) {
    // At least one is on AND permitted — one call handles all three valid combos
    navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
      .then((stream) => getUserMediaSuccess(stream))
      .catch((e) => console.error("getUserMedia error:", e));

  } else {
    // Both off — no stream to request, just release hardware entirely
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    } catch (err) {
      console.error("Error stopping tracks:", err);
    }
  }
};
```

Note: `video && videoAvailable` checks BOTH the user's toggle AND whether
permission was granted. No point requesting video if the user denied camera
access — it would just throw an error.

---

### useEffect + State Setter Pattern — Why getMedia Works This Way

```javascript
let getMedia = () => {
  setVideo(videoAvailable);   // schedules state update — doesn't apply yet
  setAudio(audioAvailable);   // schedules state update — doesn't apply yet
  // getUserMedia() is NOT called here — calling it here would read stale values
};

useEffect(() => {
  if (video !== undefined && audio !== undefined) {
    getUserMedia(); // only runs AFTER video and audio state have actually updated
  }
}, [audio, video]); // dependency array — re-runs whenever either of these changes
```

**Why not just call `getUserMedia()` directly after the setters?**

Because setters are async (see section above) — `video` and `audio` would
still have their OLD values by the time `getUserMedia()` runs. It would
request the wrong combination entirely.

`useEffect` with a dependency array solves this: React guarantees that by
the time `useEffect` runs, the state update from the setters has been
applied. So `getUserMedia()` always sees the correct, updated values.

**The bonus:** this same `useEffect` also handles future toggles
automatically. Any time the user clicks the mute button or camera button
(which calls `setAudio(!audio)` or `setVideo(!video)`), the state changes
→ `useEffect` detects the change → `getUserMedia()` runs with the new
values, automatically. You write the toggle handler once and this takes
care of the rest.

```javascript
// This is all a toggle button needs — useEffect handles the rest:
let handleVideo = () => setVideo(!video);
let handleAudio = () => setAudio(!audio);
```

---

### getDisplayMedia — Permission vs Feature Existence

Important distinction: `navigator.mediaDevices.getDisplayMedia` being a
function (truthy) has **nothing to do with whether the user has granted
screen share permission.**

```javascript
setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
```

This only answers: **"does this browser support screen sharing at all?"**

| Situation | Value of `getDisplayMedia` | `!!` result |
|---|---|---|
| Chrome, Firefox, Edge (support it) | The function itself | `true` |
| Old browser or some mobile browsers | `undefined` | `false` |
| User granted screen share permission | Still the function | `true` |
| User denied screen share permission | Still the function | `true` |

The user's permission decision happens much later — only when you actually
**call** `getDisplayMedia()` (with parentheses), which triggers the browser's
screen picker popup. This line runs before any of that.

Think of it like checking whether a vending machine has a coffee button
before you press it. `!!getDisplayMedia` = "does the machine have the
button?" Pressing it and waiting = calling `getDisplayMedia()` = that's
when permission gets asked.

`setScreenAvailable` only controls whether the Share Screen button
**appears in your UI at all** — no point showing a button that can never
work on browsers that don't support screen sharing.


### VideoMeet — Complete Current Flow (Phase 1 & Phase 2)

#### What "mounted" and "unmounted" actually mean (clear this up first)

React is NOT like a browser with actual separate pages. When you navigate
in React (using React Router), you are NOT going to a "new page" —
**you are still on the same single HTML page the entire time.**
React just swaps out which components are rendered on screen.

```
Browser loads index.html — ONE page, forever
│
├── User visits /lobby
│   React renders: <Lobby /> → MOUNTED (exists on screen, in memory)
│
├── User clicks Connect → navigates to /meeting
│   React removes: <Lobby /> → UNMOUNTED (completely destroyed, gone from memory)
│   React renders: <VideoMeet /> → MOUNTED (exists on screen, in memory)
│
└── User clicks Back → navigates back to /lobby
    React removes: <VideoMeet /> → UNMOUNTED (completely destroyed, gone from memory)
    React renders: <Lobby /> → MOUNTED (fresh start, no memory of before)
```

**Mounted** = currently rendered on screen, exists in memory RIGHT NOW
**Unmounted** = removed from screen, completely destroyed, gone from memory forever

Nothing to do with "previous page" or "next page." There IS no previous
page in React — just one page swapping components in and out.

---

#### Phase 1: User visits the meeting URL (e.g. localhost:5173/abc123)

```
VideoMeet component mounts (appears on screen)
│
├── React renders all JSX first → <video ref={localVideoRef} /> appears in DOM
│   └── localVideoRef.current = <video element> (automatically set by React)
│
└── useEffect([], []) fires ONCE after first render
    └── getPermissions() starts running (async — runs in background)
        │
        ├── [1] Ask browser for VIDEO permission (separate try/catch)
        │   ├── Granted → isVideoAvailable = true
        │   └── Denied  → isVideoAvailable = false
        │   (own try/catch — denial doesn't stop the audio check below)
        │
        ├── [2] Ask browser for AUDIO permission (separate try/catch)
        │   ├── Granted → isAudioAvailable = true
        │   └── Denied  → isAudioAvailable = false
        │   (own try/catch — denial doesn't stop the rest of function)
        │
        │   WHY LOCAL VARIABLES and not setters directly?
        │   setVideoAvailable() and setAudioAvailable() are async — they
        │   don't update the value immediately. If we used them, the
        │   checks below would still read the OLD values (false).
        │   Local variables (isVideoAvailable) update instantly. ✅
        │
        ├── [3] Now update React state — for UI display only
        │   ├── setVideoAvailable(isVideoAvailable) → updates UI
        │   └── setAudioAvailable(isAudioAvailable) → updates UI
        │
        ├── [4] Check if browser even supports screen sharing
        │   └── setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia)
        │       !! = does this function EXIST on this browser? → true/false
        │       NOT asking permission yet — just checking capability
        │       Controls whether Share Screen button shows in UI at all
        │
        └── [5] If at least one permission was granted:
            └── Get the REAL combined stream (video + audio together)
                navigator.mediaDevices.getUserMedia({
                  video: isVideoAvailable,  ← true = include video track
                  audio: isAudioAvailable   ← true = include audio track
                })
                │
                ├── Store globally → window.localStream = userMediaStream
                │   (global so WebRTC peer connections can access it later
                │    when socket callbacks run — local variables would be
                │    out of scope by then)
                │
                └── Show preview in lobby video element:
                    if (localVideoRef.current) {           ← safety guard (explained below)
                      localVideoRef.current.srcObject = userMediaStream
                    }

User now sees the lobby:
┌─────────────────────────────────┐
│  Enter into Lobby               │
│  [Username input field]         │
│  [Connect button]               │
│  [Live camera preview — muted]  │ ← autoPlay: stream plays automatically
└─────────────────────────────────┘   muted: prevents user hearing own voice (echo)
```

---

#### Phase 2: User clicks Connect button

```
connect() runs
│
├── setAskForUsername(false)
│   └── React re-renders → lobby div hidden, meeting room div shown
│       (the JSX ternary switches branch: askForUsername === true → false)
│
└── getMedia() runs
    │
    ├── setVideo(videoAvailable)   → schedules state update (async, not instant)
    └── setAudio(audioAvailable)   → schedules state update (async, not instant)

    WHY NOT call getUserMedia() directly here?
    Because setters are async — video and audio state haven't updated yet.
    Calling getUserMedia() here would read STALE old values (false).

    ↓ React finishes applying both state updates ↓

useEffect([audio, video]) detects both changed → fires
│
└── getUserMedia() runs (NOW reads correct, updated values)
    │
    ├── if (video && videoAvailable) || (audio && audioAvailable):
    │   │
    │   │   One call handles all valid combinations automatically:
    │   │   { video: true,  audio: true  } → full stream (both tracks)
    │   │   { video: false, audio: true  } → audio-only stream
    │   │   { video: true,  audio: false } → video-only stream
    │   │
    │   └── navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
    │         .then(stream => getUserMediaSuccess(stream))  ← TODO: implemented next
    │         .catch(e => console.error(e))
    │
    └── else (both video AND audio are off):
        └── stop all tracks → releases camera/mic hardware entirely
            (camera light goes off, microphone released)
```

---

#### Phase 3: Screen sharing (TODO — not yet implemented)

```
setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia)
→ Already done in Phase 1 — just checks IF browser supports screen sharing
→ Controls whether the Share Screen button appears in the UI

When user clicks Share Screen button (coming next):
handleScreen() → setScreen(!screen)
↓
useEffect([screen]) detects change → fires
↓
getDisplayMedia() runs
↓
navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
→ Browser shows screen picker popup (FIRST TIME permission is actually asked)
→ User picks which screen/window/tab to share
→ Granted → getDisplayMediaSuccess(stream) handles the rest
→ Denied  → error caught, screen sharing cancelled

Key difference from camera/mic:
Camera/mic = browser asks once, remembers your choice forever
Screen share = browser asks EVERY single time (never remembered — privacy by design)
```

---

### localVideoRef — What It Is, Why It's Checked, and the Edge Case

#### useRef vs useState — most confused pair in React

```javascript
useRef()    // { current: null }
            // stores a reference to a DOM element (or any value)
            // changing .current does NOT trigger a re-render
            // used for: pointing at DOM elements, socketRef, videoRef

useState()  // [value, setter]
            // stores data that drives what the user sees on screen
            // changing it DOES trigger a re-render
            // used for: video on/off, messages, username, etc.
```

`localVideoRef` is a `useRef` — it's a pointer to the actual `<video>`
HTML element in the DOM. It starts as `{ current: null }` and React
automatically fills in `current` when the element appears on screen.

#### React's order of operations — critical to understand

React always does things in this exact order:

```
1. Runs your component function → figures out what JSX to render
2. Renders the JSX → actual DOM elements appear on screen
   └── ref={localVideoRef} seen → localVideoRef.current = <video element>
3. THEN useEffect runs
```

So by the time `useEffect` fires and `getPermissions()` starts,
`localVideoRef.current` is already pointing at the real `<video>` element.
It is NOT null at this point.

```
Component function runs
│
├── [1] JSX rendered → <video ref={localVideoRef} autoPlay muted />
│   └── React automatically: localVideoRef.current = <video element> ✅
│   (localVideoRef.current is now NOT null)
│
└── [2] useEffect fires → getPermissions() runs
    └── if (localVideoRef.current) → TRUE ✅
        └── localVideoRef.current.srcObject = userMediaStream ✅ works
```

#### Why does the safety check still exist then?

Because `getPermissions` is `async` — it has multiple `await` calls inside
it. It does NOT finish instantly. It takes time:

```
getPermissions() starts
│
├── await getUserMedia({ video: true })    ← waiting for browser response
├── await getUserMedia({ audio: true })    ← waiting for browser response
└── await getUserMedia({ video, audio })   ← waiting for stream
```

During any of those `await` pauses, the user could navigate away.
React would immediately unmount the component — removing the `<video>`
element from the DOM and setting `localVideoRef.current` back to `null`.

But the async function keeps running in the background. JavaScript does
NOT cancel async functions when a component unmounts. The function is
running in the browser's JS engine — unmounting only destroys the DOM
elements and clears refs, it doesn't stop in-flight code.

```
getPermissions() starts running
│
├── await getUserMedia({ video: true })  ← user still on page, waiting...
│
├── await getUserMedia({ audio: true })  ← user still on page, waiting...
│        ↑
│        USER CLICKS BACK BUTTON HERE
│        React unmounts VideoMeet immediately
│        <video> element removed from DOM
│        localVideoRef.current = null ← back to null
│
└── await getUserMedia({ video, audio }) ← resolves, async continues anyway
    │
    └── if (localVideoRef.current) {     ← null check → FALSE → skips safely ✅
          localVideoRef.current.srcObject ← would have CRASHED without check ❌
        }
```

#### The related "memory leak" warning

This same unmount-while-async-running problem also affects state setters:

```javascript
// inside getPermissions(), after user navigated away:
setVideoAvailable(true); // ← React warning:
// "Can't perform a React state update on an unmounted component"
// VideoMeet is gone — React has nowhere to apply this update
```

The `if (localVideoRef.current)` guard protects against the crash.
For setters, the proper fix is an `isMounted` flag (advanced — not needed
for this project, TTL is long enough that this is extremely unlikely in
a portfolio demo scenario).

#### One-line rule to remember

> `localVideoRef.current` = null means the video element is not on screen.
> Always check it before touching it inside async functions.

---

# 17. JWT Authentication — Complete Deep Dive

---

## What JWT Actually Is

Before JWT, the old approach in this project was:

```javascript
// ❌ OLD approach — random session token
let token = crypto.randomBytes(20).toString("hex");
user.token = token;
await user.save(); // stored in DB, checked against DB on every request
```

**Problem with random session token:**
- Server has to hit the DB on EVERY request just to check "is this token valid?"
- Random hex string has no structure — no way to verify who created it without DB
- If DB goes down, no one can authenticate

**JWT fixes all of this:**
- Token is self-contained — server can verify it WITHOUT a DB lookup
- Token is cryptographically signed — can't be forged without the secret
- Any server in a cluster can verify independently — scales infinitely

Think of JWT like a **government issued ID card**:
- Your Aadhar card has your info printed on it (payload)
- It has a hologram/stamp that only the government can create (signature)
- Any police officer can verify it just by looking at it — no need to call the government (no DB lookup)
- Someone can READ your info from the card (payload is visible) but can't FAKE the hologram (signature requires the secret)

---

## Session Token vs JWT — What Changed and Why

| | Session Token (old) | JWT (current) |
|--|--|--|
| Storage | Saved in DB on every login | Never stored in DB |
| Verification | DB lookup on every request | Signature check — no DB needed |
| Fake token risk | Random string — hard to guess | Can't forge without JWT_SECRET |
| Scalability | Every server needs DB access | Any server verifies independently |
| Invalidation | Delete from DB (easy) | Needs token versioning (see below) |
| Payload visible? | No (random string) | Yes (base64 encoded — NOT encrypted) |

---

## How a JWT Token is Structured

A JWT looks like this — three parts separated by dots:

```
eyJhbGciOiJIUzI1NiJ9  .  eyJ1c2VySWQiOiI2NGYifQ  .  SflKxwRJSMeKKF2QT4fwpMeJf36P
        HEADER                      PAYLOAD                      SIGNATURE
```

Each part is separated by `.` — you can literally split by `.` to get the three parts.

### HEADER
Describes the algorithm used to create the signature:
```json
{ "alg": "HS256", "typ": "JWT" }
```
- `alg: "HS256"` = HMAC SHA256 (the signing algorithm)
- `typ: "JWT"` = this is a JWT

This gets Base64URL encoded → becomes the first part of the token.

### PAYLOAD
The actual data you put inside:
```json
{
  "userId": "64f3a2b1c9d4e5f6a7b8c9d0",
  "username": "jeffrin",
  "tokenVersion": 1,
  "iat": 1700000000,
  "exp": 1700604800
}
```
- `iat` = issued at (timestamp when token was created) — added automatically by jwt.sign
- `exp` = expiry timestamp — added automatically when you pass `expiresIn: "7d"`

This gets Base64URL encoded → becomes the second part of the token.

⚠️ **CRITICAL:** The payload is NOT encrypted — just Base64 encoded.
Anyone can decode it and read your userId, username etc.
**Never put passwords, card numbers, or sensitive data in a JWT payload.**

### SIGNATURE
The security part — proves the token wasn't tampered with:
```
HMAC_SHA256(
  base64url(header) + "." + base64url(payload),
  JWT_SECRET
)
```
This gets Base64URL encoded → becomes the third part of the token.

---

## Base64 Encoding — What It Actually Is

Base64 is NOT encryption. It's just a way to represent binary data as readable text.

```
Normal text:  { "userId": "64f" }
Base64:       eyJ1c2VySWQiOiI2NGYifQ==
```

Anyone can decode it:
```javascript
atob("eyJ1c2VySWQiOiI2NGYifQ==")
// → '{ "userId": "64f" }'
```

**Base64URL** (used in JWT) = same as Base64 but replaces `+` with `-` and `/` with `_`
so the token is safe to use in URLs without encoding issues.

Why use it at all? Because JSON contains characters like `{`, `"`, `:` that
would break URL strings and HTTP headers. Base64URL makes it URL-safe.

---

## HMAC SHA256 — How the Signature Works

HMAC = Hash-based Message Authentication Code
SHA256 = the hashing algorithm used

Think of it like a **padlock that only you have the key to:**

```
HMAC_SHA256(message, secret_key) → fixed-length hash output

message    = base64(header) + "." + base64(payload)
secret_key = your JWT_SECRET (e.g. "my_super_secret_123")
output     = "SflKxwRJSMeKKF2QT4fwpMeJf36P" (always 43 chars for SHA256)
```

**Key properties of HMAC SHA256:**
1. Same input + same key → ALWAYS same output (deterministic)
2. Change even 1 character of input → completely different output
3. You CANNOT reverse it — can't get the input back from the output
4. You CANNOT produce the correct output without knowing the secret key

This is why JWT is secure — only your server knows `JWT_SECRET`,
so only your server can produce a valid signature.

---

## How JWT Verification Works Internally

### AT SIGN TIME (during login):

```javascript
jwt.sign(
  { userId: user._id, username: user.username, tokenVersion: user.tokenVersion },
  JWT_SECRET,
  { expiresIn: "7d" }
)
```

Internally:
```
Step 1: Create header JSON   → { "alg": "HS256", "typ": "JWT" }
Step 2: Create payload JSON  → { userId, username, tokenVersion, iat, exp }
Step 3: Base64URL encode both:
        encodedHeader  = "eyJhbGciOiJIUzI1NiJ9"
        encodedPayload = "eyJ1c2VySWQiOiI2NGYifQ"
Step 4: Compute signature:
        sig = HMAC_SHA256(encodedHeader + "." + encodedPayload, JWT_SECRET)
        encodedSig = Base64URL(sig) = "SflKxwRJSMeKKF2QT4fwpMeJf36P"
Step 5: Join with dots:
        token = encodedHeader + "." + encodedPayload + "." + encodedSig
```

Final token sent to frontend → stored in localStorage.

---

### AT VERIFY TIME (on every protected request):

```javascript
jwt.verify(token, JWT_SECRET)
```

Internally:
```
Step 1: Split token by "." → [encodedHeader, encodedPayload, encodedSig]

Step 2: Re-compute expected signature:
        expectedSig = HMAC_SHA256(encodedHeader + "." + encodedPayload, JWT_SECRET)

Step 3: Compare:
        expectedSig === encodedSig (the one IN the token)?
        ✅ MATCH    → token is genuine, not tampered
        ❌ NO MATCH → token was modified → throw JsonWebTokenError

Step 4: Check expiry:
        decode payload → read exp timestamp
        exp < current time? → throw TokenExpiredError

Step 5: If all checks pass → decode payload → return { userId, username, tokenVersion, iat, exp }
```

---

## Why a Fake Token Always Fails

Scenario: hacker tries to forge a token

```
Hacker has a real token: eyJhbGci.eyJ1c2Vy.REAL_SIGNATURE
Hacker modifies payload: changes userId to admin's userId
New payload:             eyJ1c2VyADMIN
New token attempt:       eyJhbGci.eyJ1c2VyADMIN.REAL_SIGNATURE
```

At verification:
```
Expected sig = HMAC_SHA256("eyJhbGci.eyJ1c2VyADMIN", JWT_SECRET)
               → completely different hash (one char change = totally different output)

Actual sig in token = REAL_SIGNATURE (computed from original payload)

Expected ≠ Actual → jwt.verify throws → 401 → ACCESS DENIED ✅
```

The hacker can't compute the correct new signature without knowing `JWT_SECRET`.
That secret never leaves your server. That's the entire security model.

Analogy: it's like trying to forge a wax seal on a letter.
Anyone can read the letter (payload is base64 — visible).
But only the king has the signet ring (JWT_SECRET) that makes the correct seal pattern.
A forged seal pattern is immediately obvious when compared to what the signet ring would produce.

---

## The Complete Auth Flow

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGISTRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User fills name, username, password → clicks Register
    │
    ▼
handleRegister() → POST /api/users/register
    │
    ▼
Backend:
bcrypt.hash(password, 10)   → 60-char hashed password
new User({name, username, hashedPassword}) → save to MongoDB
    │
    ▼
res.status(201).json({ message: "Welcome to Connectify..." })
    │
    ▼
Frontend: Snackbar shows success message → setFormState(0) → switches to Login view

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User fills username, password → clicks Login
    │
    ▼
handleLogin() → POST /api/users/login
    │
    ▼
Backend:
User.findOne({ username })          → find user in MongoDB
bcrypt.compare(password, user.password) → verify password
    │
    ├── WRONG password → 401 → error shown in UI
    │
    └── CORRECT password:
        user.tokenVersion += 1 → save to DB (invalidates ALL previous tokens)
        jwt.sign({ userId, username, tokenVersion }, JWT_SECRET, { expiresIn: "7d" })
        → res.status(200).json({ token })
    │
    ▼
Frontend:
localStorage.setItem("token", token) → token persisted in browser
router("/home") → redirect to home page

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCESSING PROTECTED ROUTE (e.g. /home)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. withAuth HOC runs BEFORE component renders:
   localStorage.getItem("token") exists?
   NO  → navigate("/auth") → return null → component never renders
   YES → component renders normally

2. Component makes API request:
   GET /api/users/activities
   Headers: { Authorization: "Bearer eyJ..." }

3. authenticate middleware runs on backend:
   → extract token from "Bearer <token>" header
   → jwt.verify(token, JWT_SECRET) → checks signature + expiry
   → User.findById(decoded.userId) → check tokenVersion matches DB
   → req.user = decoded → next() → route handler runs and returns data

4. If ANYTHING fails (fake/expired/wrong version):
   → 401 response
   → axios interceptor catches it
   → localStorage.removeItem("token")
   → window.location.href = "/auth"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Any API error → Axios auto-throws (unlike fetch which requires manual res.ok check)
    │
    ▼
Interceptor checks: is it 401?
    ├── YES → clear token → hard redirect to /auth
    └── NO  → Promise.reject(error) → bubbles to handleLogin/handleRegister catch
                    │
                    ▼
              throw err → bubbles to handleAuth catch in Authentication.jsx
                    │
                    ▼
              setError(message) → shown in UI below input fields
```

---

## withAuth HOC — Frontend Route Protection

**HOC (Higher Order Component)** = a function that takes a component and returns
a new enhanced component. Like a wrapper that adds extra behavior.

```javascript
const withAuth = (WrappedComponent) => {   // takes Home component as input
  const AuthComponent = (props) => {
    const navigate = useNavigate();

    // synchronous check BEFORE render — prevents flash of protected UI
    const token = localStorage.getItem("token");

    if(!token){
      navigate("/auth");
      return null; // render absolutely nothing while redirect completes
      // null is needed because navigate() isn't instant —
      // React still tries to render something in that same moment
      // return null ensures zero flash of protected UI
    }

    return <WrappedComponent {...props} />;
    // {...props} spreads all props through to the original component
    // so <Home name="Jeff" /> still receives name="Jeff" even after wrapping
  };

  return AuthComponent; // returns the enhanced protected component
};

export default withAuth;

// Usage:
export default withAuth(Home); // Home is now a protected route
```

**Why synchronous check instead of useEffect:**
```javascript
// ❌ useEffect approach — causes flash:
useEffect(() => {
  if(!isAuthenticated()) navigate("/auth");
}, []);
// Component RENDERS FIRST, then useEffect runs → brief flash of Home UI

// ✅ Synchronous approach — no flash:
const token = localStorage.getItem("token");
if(!token) { navigate("/auth"); return null; }
// Check happens BEFORE render → component never renders if no token
```

**Limitation:** only checks if token EXISTS — not if it's valid.
Fake token in localStorage passes this check.
Real validation happens on backend in `authenticate` middleware.
Frontend withAuth = UX guard. Backend authenticate = real security.

---

## authenticate Middleware — Backend Route Protection

```javascript
const authenticate = async (req, res, next) => {

  // "Bearer eyJ..." → split by space → ["Bearer", "eyJ..."] → [1] gets token
  // ?. = optional chaining — if authorization header missing, returns undefined (no crash)
  const token = req.headers.authorization?.split(" ")[1];

  if(!token){
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // internally: splits token → recomputes signature → compares → checks expiry
    // throws JsonWebTokenError if signature invalid
    // throws TokenExpiredError if exp timestamp is in the past
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { userId, username, tokenVersion, iat, exp }

    // DB lookup needed ONLY for tokenVersion check — can't store mutable state in JWT
    const user = await User.findById(decoded.userId);

    if(!user){
      return res.status(404).json({ message: "Please login first" });
    }

    // tokenVersion in DB is always the LATEST (incremented on every login)
    // tokenVersion in JWT is frozen at sign time
    // mismatch means a newer login happened → this token is stale → reject
    if(user.tokenVersion !== decoded.tokenVersion){
      return res.status(401).json({ message: "Session expired, please login again" });
    }

    // attach decoded payload to request object (in-memory only, NOT saved to DB)
    // req is just a plain JS object — you can add any property to it
    // now any route handler after this middleware can access req.user.userId etc.
    req.user = decoded;
    next(); // pass control to the actual route handler

  } catch(err) {
    // catches: fake token, expired token, tampered token — all handled the same way
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
```

**Protecting a route:**
```javascript
router.get("/activities", authenticate, getUserActivities);
//                        ↑ runs first    ↑ runs only if authenticate calls next()
```

**What `req.user = decoded` actually does:**

`req` is just a plain JavaScript object Express creates fresh for each incoming request.
You can attach ANY property to it — `req.pizza = "margherita"` would work too.
Setting `req.user` is just a convention — it passes user info forward
to the next function in the middleware chain without needing to hit the DB again.
It's NOT saving to DB — just adding a property to an in-memory object that lives
for the duration of that single request.

---

## Token Versioning — Invalidating Old Sessions

**JWT's biggest weakness:** once issued, a token is valid until it expires.
If someone gets your credentials and logs in, BOTH sessions are valid simultaneously.
There's no way to "revoke" a JWT mid-life — it's stateless by design.

**Fix: token versioning**

Add `tokenVersion` to User model:
```javascript
tokenVersion: { type: Number, default: 0 }
```

On EVERY login, increment it:
```javascript
user.tokenVersion += 1; // DB value moves forward
await user.save();

const token = jwt.sign(
  { userId, username, tokenVersion: user.tokenVersion }, // baked into JWT at sign time
  JWT_SECRET,
  { expiresIn: "7d" }
);
```

In middleware, verify version matches DB:
```javascript
if(user.tokenVersion !== decoded.tokenVersion){
  return res.status(401).json({ message: "Session expired" });
}
```

**The exact flow when session is overridden:**
```
User A logs in:
  DB tokenVersion: 0 → incremented to 1 → JWT signed with tokenVersion: 1
  User A's token payload: { ..., tokenVersion: 1 }

User B logs in with User A's credentials:
  DB tokenVersion: 1 → incremented to 2 → JWT signed with tokenVersion: 2
  User B's token payload: { ..., tokenVersion: 2 }
  (User B now has valid access as User A — credentials were correct)

User A tries to access a protected route (with their OLD token):
  jwt.verify() → PASSES ✅ (token is still a valid JWT, not expired, not tampered)
  DB lookup → user.tokenVersion = 2
  decoded.tokenVersion = 1
  2 !== 1 → 401 ❌
  → axios interceptor → clears localStorage → redirect to /auth
  → User A is now logged out ✅

KEY INSIGHT:
JWT.sign captures tokenVersion VALUE at login time — frozen in token forever.
DB tokenVersion keeps incrementing on every new login.
Old tokens fall behind → get rejected on next request.
```

---

## Axios Interceptor — Global 401 Handler

**Without interceptor:** every single API call needs its own 401 handling:
```javascript
// repeated in EVERY component that makes API calls — nightmare to maintain
catch(err) {
  if(err.response?.status === 401){
    localStorage.removeItem("token");
    navigate("/auth");
  }
}
```

**With interceptor:** one place handles ALL 401s automatically:

```javascript
// apiClient.js
client.interceptors.response.use(
  (response) => response,    // success — pass through completely unchanged
  (error) => {               // ANY failed request hits this function first
    if(error.response?.status === 401){
      localStorage.removeItem("token"); // wipe stale/invalid/expired token
      window.location.href = "/auth";   // hard redirect — NOT router("/auth")
      // window.location.href = FULL PAGE RELOAD → clears all React state
      // router("/auth") = soft redirect → React state persists (could be stale/corrupted)
      // Hard redirect is safer for auth reset
    }
    return Promise.reject(error);
    // CRITICAL: re-throw error so catch blocks in handleLogin/handleRegister still fire
    // Without this line → axios thinks request SUCCEEDED after interceptor runs
    // Your catch blocks would NEVER fire → errors silently swallowed
  }
);
```

**Scope:** only intercepts requests made with THIS specific `client` instance.
Other axios instances are completely unaffected.

**Which catch block catches the re-thrown error:**
```
interceptor: return Promise.reject(error)
    │
    ▼
handleLogin/handleRegister catch block: throw err (re-throws again)
    │
    ▼
handleAuth catch block in Authentication.jsx
    │
    ▼
setError(message) → shown in UI + setOpen(true) → Snackbar shown
```

**Why two separate axios instances in this project:**
```javascript
// AuthContext.jsx — authClient (NO interceptor)
const authClient = axios.create({ baseURL: "..." });
// Login/register are PUBLIC routes — no token involved
// If 401 interceptor fired here → redirect to /auth while already on /auth → infinite loop

// apiClient.js — client (WITH interceptor)
const client = axios.create({ baseURL: "..." });
client.interceptors.response.use(...);
// Used for protected routes — /activities, /meeting etc.
// 401 here always means session expired → safe to redirect to /auth
```

---

## error.response.status vs error.response.data.status

Easy to confuse — completely different things:

```javascript
error.response.status
// The HTTP status code set by res.status() on your backend
// e.g. 401, 404, 500 — always a number
// This is what you check in the interceptor

error.response.data
// The JSON body your backend sent in res.json({...})
// e.g. { message: "Invalid token" }

error.response.data.status
// Only exists if YOU manually put a "status" field in your JSON body
// Your backend does NOT do this → this would be undefined
```

Your backend always does: `res.status(401).json({ message: "..." })`

So:
```javascript
error.response.status       → 401        ✅ use this for HTTP status checks
error.response.data         → { message: "Invalid token" }
error.response.data.message → "Invalid token"  ✅ use this for error messages
error.response.data.status  → undefined   ❌ you never set this
```

---

## JWT vs Refresh Tokens — Where This Project Sits

**This project:** JWT with 7-day expiry + token versioning. Genuine production-quality JWT.

**Refresh token pattern (used by Google, Spotify, Twitter):**
```
Access token:  short lived (15 mins) — sent with every API request
Refresh token: long lived (30 days) — stored in httpOnly cookie
               used ONLY to silently get a new access token when old one expires
```

Flow:
```
Access token expires → frontend sends refresh token to /auth/refresh
→ backend verifies refresh token → issues new access token
→ user stays logged in seamlessly (no re-login prompt)
```

**Why not implemented here:** adds significant complexity:
- Two token types to manage
- `/auth/refresh` endpoint needed
- httpOnly cookie setup (more secure than localStorage)
- Token rotation on every refresh
- Overkill for a portfolio project

**What to say in interviews:**
> "I implemented JWT with 7-day expiry and token versioning so new logins
> invalidate all previous sessions for that user. I understand the refresh
> token pattern for shorter-lived access tokens with silent renewal via
> httpOnly cookies — I kept it out of scope for this project intentionally
> since the added complexity wasn't justified, but I know exactly how
> I'd implement it."

---

## Full Code Reference

### `backend/src/controllers/userController.js` (login only)

```javascript
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// throws on server STARTUP if secret missing — fails loudly, not silently at runtime
if(!JWT_SECRET){
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const login = async(req, res) => {
  const { username, password } = req.body;

  if(!username || !password){
    return res.status(400).json({ message: "Please provide valid credentials" });
  }

  try {
    const user = await User.findOne({ username });
    if(!user) return res.status(404).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if(isPasswordCorrect){
      user.tokenVersion += 1;  // invalidates all previous tokens for this user
      await user.save();

      // sign JWT — tokenVersion baked in at this moment, frozen forever in this token
      const token = jwt.sign(
        { userId: user._id, username: user.username, tokenVersion: user.tokenVersion },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // return only the token — never expose password or sensitive fields
      return res.status(200).json({ token });

    } else {
      return res.status(401).json({ message: "Invalid Username or Password" });
    }
  } catch(err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
```

---

### `backend/middleware/auth.js`

```javascript
import jwt from "jsonwebtoken";
import User from "../src/models/userModels.js";
import httpStatus from "http-status";

const authenticate = async (req, res, next) => {
  // "Bearer eyJ..." → split(" ") → ["Bearer", "eyJ..."] → [1] → just the token
  const token = req.headers.authorization?.split(" ")[1];

  if(!token) return res.status(401).json({ message: "No token provided" });

  try {
    // verifies signature + checks expiry — throws if either fails
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // DB lookup only needed for tokenVersion check
    const user = await User.findById(decoded.userId);
    if(!user) return res.status(404).json({ message: "Please login first" });

    // DB tokenVersion always = latest login; decoded.tokenVersion = frozen at sign time
    // mismatch = newer login happened elsewhere = this session is stale
    if(user.tokenVersion !== decoded.tokenVersion){
      return res.status(401).json({ message: "Session expired, please login again" });
    }

    req.user = decoded; // attach to request object — available in all downstream handlers
    next();

  } catch(err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticate;
```

---

### `frontend/src/utils/withAuth.jsx`

```javascript
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();

    // synchronous check BEFORE render — no useEffect, no flash
    const token = localStorage.getItem("token");

    if(!token){
      navigate("/auth");
      return null; // render nothing while redirect completes — prevents any flash
    }

    return <WrappedComponent {...props} />; // {...props} passes all props through unchanged
  };

  return AuthComponent;
};

export default withAuth;
```

---

### `frontend/src/utils/apiClient.js`

```javascript
import axios from 'axios';

// Axios auto-throws on 4xx/5xx HTTP errors unlike native fetch (requires manual res.ok check)
// Error response pre-structured as err.response.data — no manual parsing needed
const client = axios.create({
  baseURL: "http://localhost:8000/api/users"
});

// Intercepts every response globally before it reaches individual catch blocks
client.interceptors.response.use(
  (response) => response,                    // success — pass through untouched
  (error) => {
    if(error.response?.status === 401){       // session expired or overridden
      localStorage.removeItem("token");       // clear stale token from browser
      window.location.href = "/auth";         // hard redirect — full page reload resets all React state
    }
    return Promise.reject(error);             // re-throw — other errors bubble to individual catch blocks
  }
);

export default client;
```

---

# 18. React Render Cycle, Security Model & Date Utilities — Complete Deep Dive


## React Render Cycle — The Most Important Rule

This is one of the most important React concepts — understand it deeply.

**The order React does things:**

```
1. Component function runs top to bottom
2. JSX is returned → painted on screen (user sees it)
3. THEN useEffect fires (after paint)
```

Think of it like a restaurant:
- Chef prepares the plate (component function runs)
- Plate is placed on the table (JSX painted on screen)
- THEN the waiter comes to ask if you need anything (useEffect runs)

The waiter (useEffect) NEVER comes before the plate is on the table.

**Why this matters:**

```javascript
// ❌ BAD — using useEffect for auth guard
useEffect(() => {
    if(!localStorage.getItem("token")){
        navigate("/auth");
    }
}, []);

// SEQUENCE:
// 1. Home JSX renders → user sees Home page briefly ← THE FLASH
// 2. useEffect fires → navigate("/auth")
// User sees Home for a split second before redirect
```

```javascript
// ✅ GOOD — synchronous check during render
const token = localStorage.getItem("token");
if(!token){
    window.location.href = "/auth"; // runs DURING render phase
    return null; // render nothing — never reaches JSX paint
}

// SEQUENCE:
// 1. Token check → no token → browser redirects immediately
// 2. Never reaches JSX paint → zero flash
```

---

## useEffect — When to Use and When NOT to Use

**useEffect is designed for SIDE EFFECTS that should happen AFTER render:**

✅ **USE useEffect for:**
```javascript
// API/DB calls on first render (when component mounts)
useEffect(() => {
    fetchUserHistory(); // fetch data after component is on screen
}, []);

// Responding to state variable changes
useEffect(() => {
    getUserMedia(); // runs whenever video or audio state changes
}, [audio, video]);

// Setting up subscriptions, event listeners, timers
useEffect(() => {
    const socket = io.connect(SERVER_URL);
    return () => socket.disconnect(); // cleanup on unmount
}, []);
```

❌ **DON'T use useEffect for:**
```javascript
// Auth guards — causes flash (component renders before redirect)
useEffect(() => {
    if(!token) navigate("/auth"); // TOO LATE — component already painted
}, []);
```

**The rule:** if something needs to happen BEFORE the user sees anything → do it synchronously during render, not in useEffect.

---

## window.location.href vs navigate() — Auth Guard Decision

```javascript
// navigate("/auth") — React Router soft redirect
// ✅ Works fine inside fully mounted components
// ❌ Unreliable during render phase (React rule violation — side effect during render)
// ❌ React state persists — can cause stale data

// window.location.href = "/auth" — browser hard redirect
// ✅ Works anywhere — doesn't depend on React at all
// ✅ Full page reload — clears ALL React state (safe for auth reset)
// ✅ Runs during render phase without violating React rules
// ✅ Instant — browser handles it before JSX ever paints
```

**For withAuth specifically — always use `window.location.href`:**

```javascript
const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {

        const token = localStorage.getItem("token");

        if(!token){
            window.location.href = "/auth"; // hard redirect — avoids React render-phase side effect limitation
            return null; // render nothing while redirect completes — prevents any flash
        }

        return <WrappedComponent {...props} />;
    };
    return AuthComponent;
};
```

**Why `return null` is needed even with `window.location.href`:**

`window.location.href` triggers the redirect but it's not INSTANT — there's a tiny moment where the component still needs to return something. Without `return null`, React tries to render `<WrappedComponent />` in that gap → possible flash. `return null` = render absolutely nothing in that gap.

---

## withAuth HOC — Partial vs Full Protection

**withAuth only checks if a token KEY EXISTS in localStorage — not if it's valid:**

```javascript
// Anyone can do this in browser console:
localStorage.setItem("token", "fakejunktoken123")
// → passes withAuth → sees Home UI ← PARTIAL PROTECTION ONLY
```

**But this is FINE for Home page** because:

```
Home page contains:
✅ A heading
✅ A meeting code input
✅ An illustration
❌ NO sensitive user data
```

Even if a hacker bypasses `withAuth` with a fake token and sees Home — they see nothing sensitive. The REAL protection happens at the backend.

**Protection levels in Connectify:**

```
1. Home page     → withAuth only (UX guard) — no sensitive data, partial protection is enough
2. Connect Button on Home page  → authenticate middleware — POST /api/users/activities blocks fake tokens 
3. History page  → withAuth + authenticate middleware — contains sensitive meeting data
4. Video call    → no auth needed — guests can join by design
```

---

## Security Model — How the Full Protection Works

### Home page — Connect button flow:

```
Hacker adds fake token to localStorage
    │
    ▼
withAuth passes (token KEY exists) → Home UI visible
    │
    ▼
Hacker enters meeting code → clicks Connect
    │
    ▼
handleJoinVideoCall() → addToUserHistory() → POST /api/users/activities
    │
    ▼
authenticate middleware → jwt.verify(fakeToken) → FAILS → 401
    │
    ▼
axios interceptor catches 401 → localStorage.removeItem("token") → redirect to /auth
    │
    ▼
Hacker is kicked out before even joining ✅
```

### History page — same flow:

```
Hacker tries to view History → clicks History button
    │
    ▼
withAuth passes → History UI starts rendering
    │
    ▼
useEffect fires → getUserHistory() → GET /api/users/activities
    │
    ▼
authenticate middleware → jwt.verify(fakeToken) → FAILS → 401
    │
    ▼
axios interceptor → clears token → redirect to /auth ✅
```

**Summary:**
- Frontend `withAuth` = UX guard (fast redirect, no blank flash for valid users)
- Backend `authenticate` middleware = real security (actual data protection)
- Both are needed, both do different jobs

---

## Why Route Handlers Get User Info from Middleware Not Frontend

This is a subtle but important pattern. Notice this on the frontend:

```javascript
// Frontend — no userId passed as argument
const meetingsHistory = await getUserHistory();
// ↑ No userId here — how does backend know WHOSE history to fetch?
```

And the backend route handler:

```javascript
// Backend — getUserHistory route handler
const getUserHistory = async (req, res) => {
    const userId = req.user.userId; // ← where does req.user come from?
    const meetings = await Meeting.find({ user_id: userId });
    res.json(meetings);
};
```

**Answer — the `authenticate` middleware sets `req.user` before the route handler runs:**

```javascript
// authenticate middleware runs FIRST:
const decoded = jwt.verify(token, JWT_SECRET);
// decoded = { userId: "64f...", username: "jeffrin", tokenVersion: 1 }

req.user = decoded; // attach decoded user info to request object
next(); // pass to getUserHistory handler

// getUserHistory handler runs SECOND:
const userId = req.user.userId; // already set by middleware — no need to pass from frontend
```

**The flow:**

```
Frontend: GET /api/users/activities
    │
    ▼
authenticate middleware:
  → extracts token from Authorization header
  → jwt.verify() → decodes { userId, username, tokenVersion }
  → req.user = decoded   ← THIS IS THE KEY STEP
  → next()
    │
    ▼
getUserHistory handler:
  → req.user.userId already available
  → queries MongoDB for that user's meetings
  → returns data
```

**Why this is the correct design:**

If frontend had to pass userId manually:
```javascript
// ❌ BAD — frontend passes userId
await getUserHistory(userId);
// Anyone could pass any userId and see someone else's history!
```

With middleware:
```javascript
// ✅ GOOD — backend extracts userId from verified JWT
req.user = decoded; // userId comes from the cryptographically verified token
// No one can fake this — JWT signature verification prevents it
```

`req` is just a plain JavaScript object Express creates fresh for each request. You can attach ANY property to it. Setting `req.user` is just a convention — it's not saved to DB, just lives in memory for the duration of that single request, passed from middleware to route handler.

---

## Date Formatting — new Date(), Date.now(), padStart

### `new Date()` vs `Date.now()`

```javascript
new Date()
// Creates a Date OBJECT — has methods like .getDate(), .getMonth(), .getFullYear()
// Example: Date Mon Jun 29 2026 05:00:00 GMT+0530

Date.now()
// Returns a plain NUMBER — milliseconds since January 1, 1970 (Unix timestamp)
// Example: 1751142600000
// Used when you just need a timestamp, not date manipulation
// This is why in userSchema: default: Date.now (not Date.now())
// Date.now = pass the FUNCTION REFERENCE (Mongoose calls it when saving)
// Date.now() = calls it immediately — every doc gets same timestamp ❌
```

### Why MongoDB saves as ISO string but Date.now() returns a number

`Date.now()` returns a plain number (milliseconds):

```javascript
Date.now() // → 1751142600000 (just a number)
```

But MongoDB doesn't store it as a raw number. When Mongoose saves a field with `type: Date`, it automatically converts whatever value you give it into a proper **ISO 8601 date string** (international standard for representing dates and times) internally :

```
What Mongoose saves to Atlas:
"2026-06-29T05:00:00.000Z"
│         │  │        │
│         │  │        └── Z = UTC timezone
│         │  └─────────── time (hours:mins:secs.ms)
│         └────────────── T = separator between date and time
└──────────────────────── date (YYYY-MM-DD)
```

So even though `Date.now()` gives a number, Mongoose converts it to this ISO format when saving. That's why when you fetch from MongoDB and do `new Date(dateString)` — you're converting that ISO string back into a JavaScript Date object that has all the methods like `.getDate()`, `.getMonth()`, `.getFullYear()`.

```javascript
// MongoDB gives you:
"2026-06-29T05:00:00.000Z"  // ISO string

// new Date() converts it to a Date object:
const date = new Date("2026-06-29T05:00:00.000Z");

// Now you have access to all Date methods:
date.getDate()      // → 29
date.getMonth()     // → 5 (0-indexed — add 1 to get 6)
date.getFullYear()  // → 2026
```

**In short:**
```
Date.now()           → plain number (timestamp)
    │
    ▼
Mongoose saves it    → ISO string in MongoDB Atlas ("2026-06-29T...")
    │
    ▼
new Date(isoString)  → Date object with .getDate(), .getMonth() etc.
```

### `new Date(dateString)` — parsing a date string from MongoDB

```javascript
const date = new Date("2026-06-29T05:00:00.000Z");
// Converts the MongoDB ISO date string into a Date object
// Now you can call methods on it:
date.getDate()      // → 29 (day of month)
date.getMonth()     // → 5 (0-indexed! January = 0, June = 5)
date.getFullYear()  // → 2026
```

⚠️ **Critical gotcha — `getMonth()` is 0-indexed:**
```javascript
date.getMonth()      // June returns 5, not 6
date.getMonth() + 1  // → 6 (correct month number)
```

### `padStart(2, "0")` — what it does

Ensures a number always has at least 2 digits by padding with "0" on the left:

```javascript
"5".padStart(2, "0")   // → "05"  (added a zero)
"12".padStart(2, "0")  // → "12"  (already 2 digits, no change)
"1".padStart(2, "0")   // → "01"  (added a zero)

// Without padStart:
// date: 5/6/2026  ← looks inconsistent

// With padStart:
// date: 05/06/2026 ← always consistent DD/MM/YYYY format
```

`.toString()` is needed first because `.getDate()` returns a number, and `padStart` only works on strings:
```javascript
date.getDate()              // → 5 (number)
date.getDate().toString()   // → "5" (string)
date.getDate().toString().padStart(2, "0")  // → "05" ✅
```

---

## formatDate Function — Full Breakdown

```javascript
let formatDate = (dateString) => {
    // dateString comes from MongoDB e.g. "2026-06-29T05:00:00.000Z"
    
    const date = new Date(dateString);
    // Converts ISO string → Date object so we can extract parts
    
    const day = date.getDate().toString().padStart(2, "0");
    // getDate() → day of month (1-31)
    // .toString() → convert number to string (padStart needs string)
    // .padStart(2, "0") → ensure 2 digits e.g. 5 → "05"
    
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    // getMonth() → 0-indexed (0=Jan, 11=Dec) → +1 to get actual month number
    // e.g. June: getMonth() = 5, +1 = 6, padStart → "06"
    
    const year = date.getFullYear();
    // getFullYear() → 4-digit year e.g. 2026 (no padding needed)

    return `${day}/${month}/${year}`;
    // Template literal → combines into DD/MM/YYYY format
    // e.g. "29/06/2026"
}
```

**Full example walkthrough:**

```
Input: "2026-06-05T10:30:00.000Z"

new Date("2026-06-05T10:30:00.000Z") → Date object

date.getDate()    → 5  → "5"  → "05"   (day)
date.getMonth()   → 5  → +1=6 → "06"   (month — June is index 5)
date.getFullYear() → 2026               (year)

return "05/06/2026"  ✅
```

**Why not just display the raw MongoDB date string?**

```javascript
// Raw MongoDB date:
"2026-06-05T10:30:00.000Z"  // confusing ISO format with timezone

// After formatDate:
"05/06/2026"  // clean DD/MM/YYYY — readable for Indian users
```

---
