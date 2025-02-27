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

  // Handle socket connections
  io.on("connection", (socket) => {
    // console.log(`New client connected: ${socket.id}`);


    // Store user ID in the socket object (or any other custom data storage)
    socket.on("set_user_id", (userId: string) => {
      socket.data.userId = userId; // Store user ID in socket's custom data
      // console.log(`User ID ${userId} set for socket: ${socket.id}`);
    });

    // Join a room
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId); // Join the specified room
      console.log(`${socket.id} joined room: ${roomId}`);
    });

    // Leave a room
    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId); // Leave the specified room
      console.log(`${socket.id} left room: ${roomId}`);
    });

    // Listen for a message event and send it to the room
    socket.on("send_message", (roomId: string, message: string) => {
      const userId = socket.data.userId || socket.id; // Fallback to socket.id if no user ID is set
      console.log(`Message from ${userId} in room: ${roomId}: ${message}`);
      io.to(roomId).emit("receive_message", { userId, message }); // Broadcast to users in the room
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
