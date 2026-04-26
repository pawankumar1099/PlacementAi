# PlacementAi

A comprehensive platform for interview preparation and placement practice. PlacementAi helps students and job seekers prepare for technical interviews through coding challenges, MCQ assessments, resume management, and interview simulations.

## Features

- **User Authentication**: Secure sign-up and login with JWT-based authentication
- **Resume Management**: Upload, parse, and manage PDF resumes
- **Coding Questions**: Practice coding problems with support for multiple languages
- **MCQ Assessments**: Test knowledge with multiple choice question sets
- **Interview Sessions**: Simulate real interview scenarios with timed sessions
- **User Dashboard**: Track progress and view personal analytics
- **Responsive Design**: Mobile-friendly frontend built with modern web technologies

## Tech Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs for password hashing
- **File Upload**: Multer for handling file uploads
- **PDF Processing**: pdf-parse for resume parsing
- **CORS**: Enabled for cross-origin requests
- **Environment Management**: dotenv for configuration

### Frontend
- **Build Tool**: Vite
- **Module System**: ES Modules
- **Environment Management**: dotenv for API configuration

## Project Structure

```
PlacementAi/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   └── authControllers.js    # Authentication logic
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Resume.js             # Resume schema
│   │   ├── Question.js           # MCQ questions schema
│   │   └── CodingQuestion.js     # Coding questions schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── resumeRoutes.js       # Resume management endpoints
│   │   ├── questionRoutes.js     # MCQ question endpoints
│   │   └── CodeRoutes.js         # Coding challenge endpoints
│   ├── uploads/                  # Uploaded files directory
│   ├── server.js                 # Express server setup
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api.js                # API client configuration
    │   ├── main.js               # Application entry point
    │   ├── style.css             # Global styles
    │   ├── ui.js                 # UI components and utilities
    │   └── views/
    │       ├── auth.js           # Authentication pages
    │       ├── dashboard.js      # User dashboard
    │       ├── resume.js         # Resume upload/view
    │       ├── mcq.js            # MCQ test interface
    │       ├── coding.js         # Coding challenge interface
    │       └── session.js        # Interview session view
    ├── public/                   # Static assets
    ├── index.html                # Main HTML template
    ├── vite.config.js            # Vite configuration
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance like MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PlacementAi
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Running the Application

**Backend (from `backend` directory)**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

**Frontend (from `frontend` directory)**
```bash
# Development mode
npm run dev

# Build for production
npm build

# Preview production build
npm preview
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Resume Management
- `GET /resume` - Get user's resume
- `POST /resume/upload` - Upload resume (PDF)
- `DELETE /resume` - Delete resume

### Questions
- `GET /questions` - Get all MCQ questions
- `GET /questions/:id` - Get specific question

### Coding Challenges
- `GET /code` - Get all coding challenges
- `POST /code/submit` - Submit code solution

## Authentication

The application uses JWT-based authentication with the following flow:

1. User registers with email and password
2. Password is hashed using bcryptjs
3. JWT token is generated upon successful login
4. Token is stored in cookies (httpOnly for security)
5. Protected routes validate the JWT token via authMiddleware

## File Upload

Resume uploads are handled using Multer and stored in the `backend/uploads` directory. Uploaded PDFs are parsed to extract user information.

## Deployment

The application is deployed on Render.com with the following URLs:
- Backend: https://placementai-backend.onrender.com
- Frontend: https://placementai-frontend.onrender.com

### CORS Configuration

The backend supports requests from:
- Local development (localhost:5000, localhost:5173, localhost:3000)
- Production deployments on Render

## Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `NODE_ENV` - Environment mode (development/production)

### Frontend
- `VITE_API_URL` - Backend API URL

## Scripts

### Backend
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm test` - Run tests (not configured yet)

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact & Support

For issues, feature requests, or questions, please open an issue in the repository.

---

**Note**: This is an active development project. More features and improvements are coming soon!
