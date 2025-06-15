const { Server } = require("socket.io");
require('dotenv').config()

let io;

const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        /* options */
        cors: {
            origin: process.env.FE_SOCKET, // KHÔNG được là '*' 
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        console.log('New client connected');

        //tạo room
        socket.on('join_room', (roomName) => {
            socket.join(roomName);
            console.log(`📦 Socket ${socket.id} joined room: ${roomName}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
}

const getIO = () => {
    if (!io) throw new Error("Socket.io chưa initialize!");
    return io;
};

module.exports = {
    initializeSocket, getIO
}
