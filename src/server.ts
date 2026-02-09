import express, { Express } from "express";
import "dotenv/config";
import cors from "cors";
import { connectDb } from "./config/db.js";
import { userRoutes } from "./router/userRouter.js";
import { riderRoutes } from "./router/riderRouter.js";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app: Express = express();
app.use(express.json());

// Read CORS origin from environment for flexibility in different environments
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin }));

connectDb();

app.use("/api/users", userRoutes);
app.use("/api/riders", riderRoutes);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigin, // read from environment
  },
});

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room based on role
  if (socket.data.user.role === "rider") {
    socket.join("riders");
  } else if (socket.data.user.role === "user") {
    socket.join("users");
  }

  // Handle location updates from riders
  socket.on("updateLocation", (data: { lat: number; lng: number }) => {
    if (socket.data.user.role === "rider") {
      // Broadcast to users
      socket.to("users").emit("riderLocationUpdate", {
        riderId: socket.data.user.userId,
        location: data,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 2026;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EDHF Logistics API",
      version: "1.0.0",
      description: "API documentation for EDHF Logistics application",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
      {
        url: "https://edhf-logistics-x7ku.onrender.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/router/*.ts"], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});
