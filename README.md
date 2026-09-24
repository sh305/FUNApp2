# FunAPP / YoYo Voice Chat Application

A full-stack real-time voice chat and social room platform.

## Architecture

- **Backend (`/backend/YoYoVoiceChatApi`)**:
  - ASP.NET Core Web API with SignalR for real-time messaging, room voice chat, live gifts, and user interactions.
  - JWT Authentication & SQL Server integration.
- **Frontend (`/frontend/YoYoApp`)**:
  - React Native / Expo application supporting mobile (Android/iOS) and Web.
  - Real-time SignalR client integration, room voice screen, gifting animations, and blocked user management.
- **Database (`/database`)**:
  - `init_database.sql` script for initializing tables, relationships, and seed data.

## Getting Started

### 1. Database Setup
Execute `database/init_database.sql` in Microsoft SQL Server to set up `YoYoVoiceChatDb`.

### 2. Backend
```bash
cd backend/YoYoVoiceChatApi
dotnet restore
dotnet run
```

### 3. Frontend
```bash
cd frontend/YoYoApp
npm install
npm start
```
