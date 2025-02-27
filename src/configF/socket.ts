import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer;

// Initialize the Socket.IO server
export const initializeSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Adjust this based on your frontend URL for security
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle signaling for video call
    socket.on("send_offer", (offer: any, roomId: string) => {
      console.log(`Sending offer to room ${roomId}`);
      socket.to(roomId).emit("receive_offer", offer, socket.id); // Send the offer to all other users in the room
    });

    socket.on("send_answer", (answer: any, roomId: string) => {
      console.log(`Sending answer to room ${roomId}`);
      socket.to(roomId).emit("receive_answer", answer); // Send the answer to all other users in the room
    });

    socket.on("send_ice_candidate", (candidate: any, roomId: string) => {
      console.log(`Sending ICE candidate to room ${roomId}`);
      socket.to(roomId).emit("receive_ice_candidate", candidate); // Send ICE candidate to other peers
    });

    // Handle joining a room for video calls
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId); // Join the specified room
      console.log(`${socket.id} joined room: ${roomId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log("Socket server initialized.");
};

// Helper method to get the socket instance (optional)
export const getSocketInstance = () => io;
