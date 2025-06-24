// README.md
# Task Manager REST API

A full-featured REST API for task management with JWT authentication, supporting both MongoDB and PostgreSQL databases.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - User registration and login
  - Protected routes
  
- **Task Management**
  - Create, read, update, delete tasks
  - Filter tasks by status and priority
  - Task ownership (users can only access their own tasks)
  
- **Database Support**
  - MongoDB with Mongoose ODM
  - PostgreSQL with native queries
  - Environment-based database selection
  
- **Security & Validation**
  - Input validation with Joi
  - Password hashing with bcrypt
  - Rate limiting
  - CORS and security headers
  - Error handling middleware

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tasks (Protected)
- `GET /api/tasks` - Get all user tasks
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users (Protected)
- `GET /api/users/profile` - Get user profile

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   DATABASE_TYPE=mongodb
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

#
