"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const pretty_json_1 = require("hono/pretty-json");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
// Load environment variables
dotenv_1.default.config();
// Create Hono app
const app = new hono_1.Hono();
// Global middleware
app.use('*', (0, cors_1.cors)());
app.use('*', error_middleware_1.logger);
app.use('*', (0, pretty_json_1.prettyJSON)());
app.use('*', error_middleware_1.errorHandler);
// Welcome route
app.get('/', (c) => {
    return c.json({
        success: true,
        message: 'Welcome to Hono MongoDB Backend API',
        version: '1.0.0',
        endpoints: {
            users: '/api/v1/users',
            health: '/health'
        }
    });
});
// Health check route
app.get('/health', (c) => {
    return c.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
// API routes
app.route('/api/v1/users', user_routes_1.default);
// 404 handler
app.notFound((c) => {
    return c.json({
        success: false,
        message: 'Route not found'
    }, 404);
});
// Initialize database and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await database_1.default.connect();
        // Start server
        const port = parseInt(process.env.PORT || '3000');
        const server = (0, node_server_1.serve)({
            fetch: app.fetch,
            port
        }, (info) => {
            console.log(`🚀 Server is running on http://localhost:${info.port}`);
            console.log(`📝 API Documentation: http://localhost:${info.port}`);
            console.log(`💚 Health check: http://localhost:${info.port}/health`);
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\nShutting down gracefully...');
            server.close();
            await database_1.default.disconnect();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            console.log('\nShutting down gracefully...');
            server.close(async (err) => {
                if (err) {
                    console.error('Error during shutdown:', err);
                    process.exit(1);
                }
                await database_1.default.disconnect();
                process.exit(0);
            });
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
startServer();
