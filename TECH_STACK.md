# StudyTime - Technology Stack

This document outlines the technologies and libraries used to build the StudyTime application. The project is structured as a fullstack JavaScript/TypeScript application with a separated frontend and backend.

## 🎨 Frontend (Client)
The frontend is a single-page application (SPA) built for high performance and a rich, interactive user experience.

* **Core Framework**: [React 19](https://react.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/) for static typing and enhanced developer experience
* **Build Tool**: [Vite](https://vitejs.dev/) (fast and lean development server and bundler)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) for utility-first, responsive styling
* **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (specifically `io5` Ionicons)
* **Routing**: Uses state-based routing (custom implementation via `activeTab` state)

## ⚙️ Backend (Server)
The backend provides a RESTful API to manage users, study subjects, sessions, and settings.

* **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
* **Web Framework**: [Express.js](https://expressjs.com/) (v5)
* **Database**: [MySQL](https://www.mysql.com/) (accessed via `mysql2` promise wrapper)
* **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) (`jsonwebtoken`)
* **Password Hashing**: `bcryptjs`
* **Environment Variables**: `dotenv`
* **Cross-Origin Resource Sharing**: `cors`
* **Development Auto-restart**: `nodemon`

## 🏗️ Architecture & Integration
* **API Communication**: The frontend communicates with the backend via native `fetch` requests (configured in `src/utils/api.ts`).
* **Authentication Flow**: Users log in, receive a JWT token, which is stored in `localStorage` and sent as a Bearer token in the `Authorization` header for subsequent protected requests.
* **Database Driver**: The backend uses connection pooling (`mysql2/promise`) to efficiently manage database connections.
* **Production Deployment**: The backend is configured to serve the built frontend static files (`dist/`) directly when running in a production environment, enabling a simplified single-service deployment if desired.
