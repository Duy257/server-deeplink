# Hono MongoDB Backend

A modern, type-safe backend API built with Hono, Node.js, and MongoDB.

## Features

- 🚀 Built with [Hono](https://hono.dev/) - A fast, lightweight web framework
- 📦 MongoDB integration with native driver
- 🔐 Input validation with Zod
- 🎯 TypeScript support
- 🛠️ CRUD operations for User management
- 📝 Error handling middleware
- 📊 Pagination support
- ⚡ Hot reload in development

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

```bash
# Open in browser
open http://localhost:3000
```

## API Endpoints

- `GET /` - Welcome page
- `GET /health` - Health check
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## Testing with curl

```bash
# Create user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Get all users
curl http://localhost:3000/api/v1/users
```
