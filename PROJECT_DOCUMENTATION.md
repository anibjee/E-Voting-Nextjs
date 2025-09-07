# E-Voting Application - Technical Documentation

## 📋 Project Overview

A secure, full-stack e-voting application built with modern web technologies, featuring role-based authentication, candidate management, and real-time vote counting. This application demonstrates enterprise-level security practices and scalable architecture patterns.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 with Turbopack
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: Next.js App Router

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Middleware**: Custom JWT middleware for protected routes

### Security Features
- JWT-based authentication with secure cookies
- Password hashing with bcryptjs (salt rounds: 10)
- Role-based access control (Admin/Voter)
- Route protection middleware
- Input validation and sanitization

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React Pages   │    │ • JWT Auth      │    │ • User Model    │
│ • Context API   │    │ • Middleware    │    │ • Candidate     │
│ • TypeScript    │    │ • Protected     │    │ • Vote Records  │
│ • Tailwind CSS  │    │   Routes        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 Authentication Flow

### 1. User Registration
```typescript
POST /api/user/signup
{
  name: string,
  age: number,
  email?: string,
  mobile?: string,
  address: string,
  aadharCardNumber: number,
  password: string,
  role: 'voter' | 'admin'
}
```

### 2. Login Process
```typescript
POST /api/user/login
{
  aadharCardNumber: number,
  password: string
}
```

### 3. JWT Token Flow
- Server generates JWT with user ID payload
- Token stored in HTTP-only cookies and localStorage
- Middleware validates token on protected routes
- Auto-logout on token expiration (24 hours)

## 🛡️ Security Implementation

### Middleware Protection
```typescript
// middleware.ts - Route Protection
export function middleware(request: NextRequest) {
  // Public routes bypass authentication
  if (isPublicRoute(pathname)) return NextResponse.next();
  
  // Extract and verify JWT token
  const token = getTokenFromCookiesOrHeaders(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.redirect('/login');
  }
  
  return NextResponse.next();
}
```

### Password Security
- Passwords hashed using bcryptjs with salt
- No plain text passwords stored in database
- Secure password comparison on login

### State Management Security
- Authentication state managed via React Context
- Automatic logout on invalid tokens
- Protected route redirects for unauthorized access

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  age: Number (required),
  email: String (optional),
  mobile: String (optional),
  address: String (required),
  aadharCardNumber: Number (required, unique),
  password: String (required, hashed),
  role: Enum['voter', 'admin'] (default: 'voter'),
  isVoted: Boolean (default: false),
  
  // Candidate Application Fields
  isCandidateApplicant: Boolean (default: false),
  candidateApplicationStatus: Enum['pending', 'approved', 'rejected', 'none'],
  candidateParty: String (optional),
  candidateManifesto: String (optional),
  candidateAppliedAt: Date (optional),
  candidateApprovedAt: Date (optional)
}
```

### Candidate Model
```javascript
{
  name: String (required),
  party: String (required),
  age: Number (required),
  votes: [
    {
      user: ObjectId (ref: 'User'),
      votedAt: Date (default: Date.now)
    }
  ],
  voteCount: Number (default: 0),
  applicantUser: ObjectId (ref: 'User', optional),
  manifesto: String (optional),
  isFromUserApplication: Boolean (default: false)
}
```

## 🎯 Core Features

### 1. Multi-Role Authentication System
- **Admin Role**: 
  - Candidate management (CRUD operations)
  - Vote count monitoring
  - User application approval/rejection
- **Voter Role**:
  - Profile management
  - Voting functionality (one vote per user)
  - Candidate application submission

### 2. Candidate Management
```typescript
// Admin can add candidates directly
POST /api/candidate
{
  name: string,
  party: string,
  age: number
}

// Users can apply to become candidates
POST /api/candidate/apply
{
  party: string,
  manifesto: string
}
```

### 3. Voting System
```typescript
// Secure voting endpoint
GET /api/candidate/vote/[candidateId]
// Validates: user authentication, not already voted, candidate exists
// Updates: candidate vote count, user isVoted status
```

### 4. Real-time Vote Counting
```typescript
GET /api/candidate/vote/count
// Returns aggregated vote counts by party
[
  { party: "Party A", voteCount: 150 },
  { party: "Party B", voteCount: 120 }
]
```

## 🔄 Application Workflow

### Admin Workflow
1. **Login** → Admin Dashboard
2. **Manage Candidates** → Add/Edit/Delete candidates
3. **Review Applications** → Approve/Reject candidate applications
4. **Monitor Results** → View real-time vote counts
5. **User Management** → View user statistics

### Voter Workflow
1. **Registration** → Account creation with Aadhar verification
2. **Login** → Voter Dashboard
3. **Profile Management** → Update password, view status
4. **Apply for Candidacy** → Submit application (optional)
5. **Vote** → Select candidate (one-time only)
6. **View Status** → Check voting confirmation

## 🛠️ Technical Challenges Solved

### 1. Authentication Race Conditions
**Problem**: Dashboard flashing after logout/login cycles
**Solution**: 
- Implemented state management with `loggingOut` and `loginPending` flags
- Added proper timing delays for state cleanup
- Fixed useEffect dependency management

### 2. JWT Security in Edge Runtime
**Problem**: Next.js Edge Runtime doesn't support Node.js crypto module
**Solution**: 
- Configured middleware to run in Node.js runtime
- Added proper JWT verification with fallback handling

### 3. State Persistence Issues
**Problem**: Stale authentication state after logout
**Solution**:
- Comprehensive state cleanup (localStorage, cookies, axios headers)
- Coordinated state reset with proper timing

## 📁 Project Structure

```
e-voting-nextjs/
├── src/
│   ├── app/
│   │   ├── admin-dashboard/
│   │   │   └── page.tsx
│   │   ├── voter-dashboard/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── user/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── signup/route.ts
│   │   │   │   └── profile/route.ts
│   │   │   └── candidate/
│   │   │       ├── route.ts
│   │   │       ├── apply/route.ts
│   │   │       ├── vote/[candidateId]/route.ts
│   │   │       └── applications/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx (Login)
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   └── jwt.ts
│   ├── models/
│   │   ├── User.ts
│   │   └── Candidate.ts
│   └── middleware.ts
├── .env.local
└── package.json
```

## 🚦 API Endpoints

### Authentication
- `POST /api/user/signup` - User registration
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile (Protected)
- `PUT /api/user/profile/password` - Update password (Protected)

### Candidate Management
- `GET /api/candidate` - List all candidates
- `POST /api/candidate` - Add candidate (Admin only)
- `PUT /api/candidate/[id]` - Update candidate (Admin only)
- `DELETE /api/candidate/[id]` - Delete candidate (Admin only)

### Voting System
- `GET /api/candidate/vote/[candidateId]` - Cast vote (Voter only)
- `GET /api/candidate/vote/count` - Get vote counts (Protected)

### Candidate Applications
- `POST /api/candidate/apply` - Apply for candidacy (Voter only)
- `GET /api/candidate/applications` - List applications (Admin only)
- `PUT /api/candidate/applications/[id]` - Approve/Reject (Admin only)

## 🧪 Testing Strategy

### Manual Testing Scenarios
1. **User Registration**: Valid/Invalid data validation
2. **Authentication**: Login/Logout cycles, token expiration
3. **Role-based Access**: Admin vs Voter permissions
4. **Voting Logic**: One vote per user enforcement
5. **Candidate Management**: CRUD operations
6. **Application Flow**: User application → Admin approval → Candidate creation

## 🔧 Environment Configuration

```env
# .env.local
JWT_SECRET=your_super_secret_jwt_key_here_12345
MONGODB_URL_LOCAL=mongodb://localhost:27017/voting
NEXTAUTH_SECRET=voting-app-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Deployment Considerations

### Production Optimizations
- Use secure JWT secrets (env variables)
- Implement rate limiting for API endpoints
- Add request validation middleware
- Set up MongoDB Atlas for cloud database
- Configure proper CORS policies
- Add comprehensive error logging

### Scalability Features
- Stateless JWT authentication (horizontal scaling)
- MongoDB sharding support
- API route optimization with caching
- Lazy loading for dashboard components

## 💡 Key Interview Talking Points

### Technical Excellence
- **Modern Stack**: Latest Next.js with TypeScript and Tailwind
- **Security-First**: JWT auth, password hashing, route protection
- **Scalable Architecture**: Modular design, separation of concerns
- **Error Handling**: Comprehensive error management and user feedback

### Problem-Solving Skills
- **Authentication Challenges**: Solved complex state management issues
- **Performance**: Optimized with proper loading states and error boundaries
- **User Experience**: Smooth transitions, real-time updates

### Best Practices Demonstrated
- **TypeScript**: Strong typing throughout the application
- **Code Organization**: Clean architecture with proper file structure
- **Security**: Industry-standard authentication and authorization
- **Database Design**: Normalized schema with proper relationships

---

## 🎯 Interview Questions You Can Answer

### Technical Questions
**Q: How did you implement authentication?**
**A:** "I used JWT-based authentication with secure HTTP-only cookies. The flow includes user registration with bcrypt password hashing, login with JWT token generation, and middleware-based route protection. I also implemented role-based access control for admin and voter permissions."

**Q: What challenges did you face?**
**A:** "The main challenge was authentication state management during logout/login cycles. I solved it by implementing proper state flags, timing coordination, and fixing race conditions in the React Context API."

**Q: How did you ensure security?**
**A:** "I implemented multiple security layers: password hashing with bcrypt, JWT tokens with expiration, HTTP-only cookies, input validation, role-based access control, and protected API routes with middleware validation."

**Q: How would you scale this application?**
**A:** "The application is already designed for scalability with stateless JWT authentication, MongoDB for horizontal scaling, modular API routes, and separate client/server concerns. For production, I'd add Redis caching, load balancing, and database sharding."

This documentation provides a comprehensive overview of your e-voting application that demonstrates full-stack development skills, security awareness, and problem-solving capabilities - perfect for technical interviews!
