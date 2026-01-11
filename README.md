# Logistics Corp Management System

A comprehensive logistics management system built with Spring Boot backend and React frontend.

## Overview

The Logistics Corp Management System is a full-stack application designed to manage inventory and user profiles for logistics operations. The system features role-based access control, JWT authentication, and a responsive user interface.

## Features

- **User Authentication & Authorization**: Secure login and registration with JWT tokens
- **Inventory Management**: Add, update, and display inventory items
- **User Profile Management**: Update user profile information
- **Role-based Access Control**: Different permissions for admin and regular users
- **History Logging**: Track changes and operations
- **Responsive UI**: Modern React frontend with intuitive interface

## Tech Stack

### Backend
- **Spring Boot** - Java framework for building the REST API
- **Spring Security** - Authentication and authorization
- **JWT** - Token-based authentication
- **Spring Data JPA** - Database access and ORM
- **MySQL/H2** - Database storage

### Frontend
- **React** - JavaScript library for building user interfaces
- **Axios** - HTTP client for API communication
- **CSS** - Styling

## Architecture

The application follows a Model-View-Controller (MVC) architecture pattern:
- **Frontend**: React components handle user interactions and display data
- **Backend**: Spring Boot controllers expose REST APIs
- **Database**: JPA entities mapped to database tables
- **Security**: JWT-based authentication and authorization

## Installation & Setup

### Prerequisites
- Java 11+ (for backend)
- Node.js and npm (for frontend)
- Maven (for building Spring Boot app)

### Backend Setup
1. Navigate to the Backend directory: `cd Backend`
2. Update `application.properties` with your database configuration
3. Build the project: `mvn clean install`
4. Run the application: `mvn spring-boot:run`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /authenticate` - User login
- `POST /register` - User registration

### User Management
- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Inventory Management
- `GET /inventory` - Get all inventory items
- `GET /inventory/{id}` - Get item by ID
- `POST /inventory` - Add new item
- `PUT /inventory/{id}` - Update item
- `DELETE /inventory/{id}` - Delete item

### Profile Management
- `GET /profile/{userId}` - Get user profile
- `PUT /profile/{userId}` - Update user profile

## Database Schema

The application uses the following main entities:
- **UserModel**: Stores user credentials and information
- **InventoryModel**: Stores inventory item details
- **HistoryLog**: Tracks changes to inventory items

## Security

The application implements security using:
- JWT (JSON Web Tokens) for authentication
- Spring Security for authorization
- Password encoding using BCrypt
- CORS configuration for secure cross-origin requests

## Environment Configuration

Required environment variables (in `application.properties`):
- Database connection details
- JWT secret key
- Server configuration

## Deployment

The application can be deployed as:
- Backend: Package as JAR/WAR and deploy to server
- Frontend: Build static assets and serve via web server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.