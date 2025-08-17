"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const pretty_json_1 = require("hono/pretty-json");
// Create Hono app
const app = new hono_1.Hono();
// Global middleware
app.use('*', (0, cors_1.cors)());
app.use('*', (0, pretty_json_1.prettyJSON)());
// Welcome route
app.get('/', (c) => {
    return c.json({
        success: true,
        message: 'Welcome to Hono MongoDB Backend API (Test Mode)',
        version: '1.0.0',
        note: 'This is running without MongoDB connection',
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
        database: 'not connected (test mode)',
        timestamp: new Date().toISOString()
    });
});
// Mock user data
const mockUsers = [
    {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439012',
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
// Mock API routes
app.get('/api/v1/users', (c) => {
    return c.json({
        success: true,
        data: mockUsers,
        pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
        }
    });
});
app.get('/api/v1/users/:id', (c) => {
    const id = c.req.param('id');
    const user = mockUsers.find(u => u._id === id);
    if (!user) {
        return c.json({
            success: false,
            message: 'User not found'
        }, 404);
    }
    return c.json({
        success: true,
        data: user
    });
});
app.post('/api/v1/users', async (c) => {
    const body = await c.req.json();
    const newUser = {
        _id: Date.now().toString(),
        ...body,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    return c.json({
        success: true,
        message: 'User created successfully (mock)',
        data: newUser
    }, 201);
});
// 404 handler
app.notFound((c) => {
    return c.json({
        success: false,
        message: 'Route not found'
    }, 404);
});
// Start server
const port = 3000;
(0, node_server_1.serve)({
    fetch: app.fetch,
    port
}, (info) => {
    console.log(`🚀 Test server is running on http://localhost:${info.port}`);
    console.log(`📝 API Documentation: http://localhost:${info.port}`);
    console.log(`💚 Health check: http://localhost:${info.port}/health`);
    console.log(`⚠️  Note: This is running in test mode without MongoDB`);
});
