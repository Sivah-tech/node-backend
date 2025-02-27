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
    socket.on("send_offer", (offer: RTCSessionDescriptionInit, roomId: string) => {
      console.log(`Client ${socket.id} sending offer to room ${roomId}`);
      socket.to(roomId).emit("receive_offer", offer, socket.id);
    });

    socket.on("send_answer", (answer: RTCSessionDescriptionInit, roomId: string) => {
      console.log(`Client ${socket.id} sending answer to room ${roomId}`);
      socket.to(roomId).emit("receive_answer", answer);
    });

    socket.on("send_ice_candidate", (candidate: RTCIceCandidateInit, roomId: string) => {
      console.log(`Client ${socket.id} sending ICE candidate to room ${roomId}`);
      socket.to(roomId).emit("receive_ice_candidate", candidate);
    });

    // Handle joining a room for video calls
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      
      // Notify others in the room
      const clients = io.sockets.adapter.rooms.get(roomId);
      const numClients = clients ? clients.size : 0;
      
      console.log(`Client ${socket.id} joined room: ${roomId} (${numClients} clients)`);
      
      // You can also notify other participants (optional)
      socket.to(roomId).emit("user_joined", { userId: socket.id });
    });

    // Handle leaving a room
    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`Client ${socket.id} left room: ${roomId}`);
      socket.to(roomId).emit("user_left", { userId: socket.id });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      // You could notify rooms this user was in that they've disconnected
    });
  });

  console.log("Socket server initialized.");
  return io;
};

// Helper method to get the socket instance
export const getSocketInstance = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized. Call initializeSocket first.");
  }
  return io;
};
