# E-Voting App - Next.js

🗳️ A secure e-voting application built with Next.js 15, TypeScript, MongoDB Atlas, and Tailwind CSS.

## 🚀 Live Demo

**🔗 [View Live Application](https://e-voting-nextjs-fdxn.vercel.app/)**

*Deployed on Vercel with MongoDB Atlas*

## Features

### User Authentication
- **Signup**: Users can register as voters or admins with Aadhaar number validation
- **Login**: Secure JWT-based authentication
- **Role-based Access**: Different dashboards for voters and admins

### Voter Features
- **Profile Management**: View profile information and update password
- **Voting**: Vote for candidates (one vote per user)
- **Vote Status**: Track whether you've already voted

### Admin Features
- **Candidate Management**: Add, update, and delete candidates
- **Vote Monitoring**: View real-time vote counts for all candidates
- **Admin Controls**: Full CRUD operations on candidate data

## Technology Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (Cloud) with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with NextAuth
- **Password Security**: bcryptjs for password hashing
- **Deployment**: Vercel (Production)
- **Styling**: Tailwind CSS with responsive design

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Ensure `.env.local` file exists with:
   ```env
   MONGODB_URL_LOCAL=mongodb://localhost:27017/voting
   JWT_SECRET=<YOUR SECRET KEY>
   NEXTAUTH_SECRET=<YOUR SECRET KEY>
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Start MongoDB**
   Make sure your MongoDB server is running locally or update the connection string for cloud MongoDB.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Getting Started

1. **Create an Admin Account**
   - Go to signup page
   - Fill in all required fields
   - Select "Admin" as role
   - Complete registration

2. **Add Candidates**
   - Login as admin
   - Use the admin dashboard to add candidates
   - Fill in candidate name, party, and age

3. **Create Voter Accounts**
   - Users can signup as voters
   - Each Aadhaar number can only be used once

4. **Voting Process**
   - Voters login to their dashboard
   - View available candidates
   - Cast one vote per account
   - Vote status is tracked and prevents multiple voting

5. **View Results**
   - Admin can view real-time vote counts
   - Results are sorted by vote count (descending)

## API Routes

### User Routes
- `POST /api/user/signup` - User registration
- `POST /api/user/login` - User authentication
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile/password` - Update password (protected)

### Candidate Routes
- `GET /api/candidate` - Get all candidates
- `POST /api/candidate` - Add candidate (admin only)
- `PUT /api/candidate/[id]` - Update candidate (admin only)
- `DELETE /api/candidate/[id]` - Delete candidate (admin only)
- `GET /api/candidate/vote/[id]` - Vote for candidate (voters only)
- `GET /api/candidate/vote/count` - Get vote counts

## Deployment

### Production Environment
The application is deployed on Vercel with the following environment variables:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/voting
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### Deploy Your Own
1. Fork this repository
2. Connect your GitHub repo to Vercel
3. Set up MongoDB Atlas cluster
4. Configure environment variables in Vercel dashboard
5. Deploy!

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and voter roles with different permissions
- **Aadhaar Validation**: 12-digit Aadhaar number validation
- **Duplicate Prevention**: Users can only vote once
- **Admin Restrictions**: Only one admin can exist in the system
- **Environment Security**: Sensitive data protected via environment variables
