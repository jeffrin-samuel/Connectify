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