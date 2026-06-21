# Hilton Quiz App - Medical Knowledge Competition Platform

A comprehensive quiz competition platform designed specifically for medical professionals, featuring both a mobile app and web admin panel.

## Features

### Mobile App
- **User Registration & Authentication**: Doctor-specific registration with PMDC verification
- **Single Player Mode**: Practice quizzes with standard scoring (10 points correct, -5 wrong)
- **Multiplayer Mode**: Real-time competition with double scoring (20 points correct, -5 wrong)
- **Category-based Quizzes**: Organized by medical specialties
- **Leaderboard**: Track top performers
- **Profile Management**: View statistics and achievements

### Web Admin Panel
- **User Management**: Approve/activate doctor accounts
- **Category Management**: Create and manage quiz categories
- **Question Management**: Add, edit, and organize quiz questions
- **Analytics Dashboard**: Comprehensive insights and statistics
- **Real-time Monitoring**: Track user activity and performance

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **JWT** for authentication
- **Socket.io** for real-time multiplayer features
- **Bcrypt** for password hashing

### Mobile App
- **React Native** with Expo
- **React Navigation** for navigation
- **Axios** for API communication
- **React Hook Form** for form management
- **Expo Linear Gradient** for UI styling

### Admin Panel
- **React** with modern hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for analytics visualization
- **Axios** for API communication

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Expo CLI for mobile development
- Git

### Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hilton_quiz
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

### Admin Panel Setup

1. **Navigate to admin panel directory**:
   ```bash
   cd admin-panel
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

   The admin panel will be available at `http://localhost:3000`

### Mobile App Setup

1. **Navigate to mobile app directory**:
   ```bash
   cd mobile-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For web: `npm run web`

### Quick Start (All Services)

From the root directory, you can start all services at once:

```bash
npm run install-all  # Install all dependencies
npm run dev          # Start backend and admin panel
```

Then in a separate terminal:
```bash
cd mobile-app && npm start
```

## Project Structure

```
hilton-quiz-app/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── admin-panel/           # Web admin panel
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
├── mobile-app/            # React Native mobile app
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── assets/            # App assets
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id/approve` - Approve user (admin)
- `PUT /api/users/:id/activate` - Activate user (admin)
- `GET /api/users/leaderboard` - Get leaderboard

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Questions
- `GET /api/questions/category/:id` - Get questions by category
- `POST /api/questions` - Create question (admin)
- `PUT /api/questions/:id` - Update question (admin)
- `DELETE /api/questions/:id` - Delete question (admin)

### Quiz
- `POST /api/quiz/start` - Start new quiz session
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/history` - Get user's quiz history

### Analytics
- `GET /api/analytics/overview` - Get overview statistics
- `GET /api/analytics/user-activity` - Get user activity data
- `GET /api/analytics/category-performance` - Get category performance
- `GET /api/analytics/top-performers` - Get top performers

## Scoring System

### Single Player Mode
- Correct answer: +10 points
- Wrong answer: -5 points

### Multiplayer Mode
- Correct answer: +20 points (double points)
- Wrong answer: -5 points

## User Registration Fields

- Doctor Name
- Designation
- Specialty
- Hospital Name
- PMDC Number
- City
- Phone Number
- Email ID

## Admin Features

- **User Approval**: Review and approve doctor registrations
- **Account Management**: Activate/deactivate user accounts
- **Content Management**: Create and manage categories and questions
- **Analytics**: View comprehensive statistics and insights
- **Real-time Monitoring**: Track user activity and performance

## Development Notes

### Database Models
- **User**: Doctor information and statistics
- **Category**: Quiz categories
- **Question**: Quiz questions with options and explanations
- **QuizSession**: User quiz attempts and results

### Authentication
- JWT-based authentication
- Role-based access control (user/admin)
- Account approval workflow

### Real-time Features
- Socket.io for multiplayer functionality
- Real-time leaderboard updates
- Live game sessions

## Deployment

### Backend
- Deploy to services like Heroku, DigitalOcean, or AWS
- Set up MongoDB Atlas for production database
- Configure environment variables

### Admin Panel
- Build and deploy to services like Netlify or Vercel
- Update API endpoints for production

### Mobile App
- Build for iOS App Store and Google Play Store
- Configure app signing and certificates
- Update API endpoints for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.


