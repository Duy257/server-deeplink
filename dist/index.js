import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import dotenv from "dotenv";
import database from "./config/database.js";
import openAppRoutes from "./routes/open-app.routes.js";
import { errorHandler, logger } from "./middleware/error.middleware.js";
// Load environment variables
dotenv.config();
// Create Hono app
const app = new Hono();
// Global middleware
app.use("*", cors());
app.use("*", logger);
app.use("*", prettyJSON());
app.use("*", errorHandler);
// Welcome route
app.get("/", (c) => {
    return c.json({
        success: true,
        message: "Welcome to Hono MongoDB Backend API",
        version: "1.0.0",
        endpoints: {
            users: "/api/v1/users",
            health: "/health",
        },
    });
});
// Health check route
app.get("/health", (c) => {
    return c.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.route("/api", openAppRoutes);
// 404 handler
app.notFound((c) => {
    return c.json({
        success: false,
        message: "Route not found",
    }, 404);
});
// Initialize database and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await database.connect();
        // Start server
        const port = parseInt(process.env.PORT || "3000");
        const server = serve({
            fetch: app.fetch,
            port,
        }, (info) => {
            console.log(`🚀 Server is running on http://localhost:${info.port}`);
            console.log(`📝 API Documentation: http://localhost:${info.port}`);
            console.log(`💚 Health check: http://localhost:${info.port}/health`);
        });
        // Graceful shutdown
        process.on("SIGINT", async () => {
            console.log("\nShutting down gracefully...");
            server.close();
            await database.disconnect();
            process.exit(0);
        });
        process.on("SIGTERM", async () => {
            console.log("\nShutting down gracefully...");
            server.close(async (err) => {
                if (err) {
                    console.error("Error during shutdown:", err);
                    process.exit(1);
                }
                await database.disconnect();
                process.exit(0);
            });
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
// Start the server
startServer();
