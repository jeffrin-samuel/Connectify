import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}

export default function connectToSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        }
    });

    io.on("connection", (socket)=>{

        console.log("Something Connected");  //for testing

        socket.on("join-call", (path) => {   //In which path (the url) is the participant trying to join eg localhost/2836

            if(connections[path] === undefined){   
                connections[path] = [];
            }
            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();  

            for(let i = 0; i < connections[path].length; i++){
                io.to(connections[path][i]).emit("user-joined", socket.id, connections[path]); // send who joined + the full list of everyone in the room
            }

            if(messages[path] !== undefined){     
                for(let i = 0; i < messages[path].length; ++i){
                    io.to(socket.id).emit("chat-message", messages[path][i]['data'],
                        messages[path][i]['sender'], messages[path][i]['socket-id-sender']
                    )
                }
            }

        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)   
            .reduce(( [room, isFound], [roomKey, roomValue]) => {

                if(!isFound && roomValue.includes(socket.id)) {
                    return [roomKey, true];
                }
                return [room, isFound];

            }, ['', false]); 

            if(found === true){
                if(messages[matchingRoom] === undefined){   
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ "sender": sender, "data": data, "socket-id-sender": socket.id }); 
                console.log("message", ":", sender, data);

                connections[matchingRoom].forEach(elem => {    
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                });
            }

        });

        socket.on("disconnect", () => {
            let diffTime = Math.abs(timeOnline[socket.id] - new Date());
            
            let roomKey;

            for (const[room, attendees] of JSON.parse(JSON.stringify(Object.entries(connections)))) {  //Deep copy since we have to drop keys and all when user disconnects

                for(let i = 0; i < attendees.length; ++i){    
                    if(attendees[i] == socket.id){   //If matches with the socketId of disconnected user
                        roomKey = room;

                        for(let j = 0; j < connections[roomKey].length; ++j){    
                            io.to(connections[roomKey][j]).emit('user-left', socket.id); 
                        }

                        let index = connections[roomKey].indexOf(socket.id);  

                        connections[roomKey].splice(index, 1); //remove that socket id from the attendees list in that specific room

                        if(connections[roomKey].length == 0){   //If no one in the room
                            delete connections[roomKey];
                            delete messages[roomKey]; // clear chat history when room empties
                        }
                    }
                }
            }

        });
    })

    return io;
}



