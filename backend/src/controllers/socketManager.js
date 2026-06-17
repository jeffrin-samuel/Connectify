import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        }
    });

    io.on("connection", (socket)=>{

        socket.on("join-call", (path) => {   //In which path (the url) is the participant trying to join eg localhost/2836

            if(connections[path] === undefined){   
                connections[path] = [];
            }
            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();  

            for(let i = 0; i < connections[path].length; i++){
                io.to(connections[path][i]).emit("user-joined", socket.id);
            }

            if(messages[path] !== undefined){      //WHAT's THIS?
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

            const [matchingRoom, found] = Object.entries(connections)   //What's this Higher-Order functions?
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

                connections[matchingRoom].forEach(elem => {    //what elem demonstrates here? attendees in that room?
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                });
            }

        });

        socket.on("disconnect", () => {
            let diffTime = Math.abs(timeOnline[socket.id] - new Date());
            
            let roomKey;

            for (const[room, attendees] of JSON.parse(JSON.stringify(Object.entries(connections)))) {  //deep copy since we have to drop keys and all when user disconnects

                for(let i = 0; i < attendees.length; ++i){    
                    if(attendees[i] == socket.id){   //if it matches with the socketId of disconnected user
                        roomKey = room;

                        for(let j = 0; j < connections[roomKey].length; ++j){    
                            io.to(connections[roomKey][j]).emit('user-left', socket.id); 
                        }

                        let index = connections[roomKey].indexOf(socket.id);  

                        connections[roomKey].splice(index, 1); //remove that socket id from the attendees list in that specific room

                        if(connections[roomKey].length == 0){   //if no one in the room
                            delete connections[roomKey];
                        }
                    }
                }
            }

        });
    })

    return io;
}



