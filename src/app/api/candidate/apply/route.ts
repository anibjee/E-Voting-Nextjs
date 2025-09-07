import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { jwtAuthMiddleware } from '@/lib/jwt';

// POST - Apply to become a candidate
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await jwtAuthMiddleware(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId } = authResult;
    const { party, manifesto } = await request.json();

    // Validate required fields
    if (!party || !manifesto) {
      return NextResponse.json(
        { error: 'Party name and manifesto are required' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is admin (admins cannot apply as candidates)
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Administrators cannot apply as candidates' },
        { status: 403 }
      );
    }

    // Check if user has already applied
    if (user.isCandidateApplicant && user.candidateApplicationStatus !== 'rejected') {
      return NextResponse.json(
        { error: 'You have already applied as a candidate' },
        { status: 400 }
      );
    }

    // Check if user has already voted (candidates shouldn't be able to vote)
    if (user.isVoted) {
      return NextResponse.json(
        { error: 'Users who have voted cannot apply as candidates' },
        { status: 400 }
      );
    }

    // Update user with candidacy application
    user.isCandidateApplicant = true;
    user.candidateApplicationStatus = 'pending';
    user.candidateParty = party;
    user.candidateManifesto = manifesto;
    user.candidateAppliedAt = new Date();

    await user.save();

    return NextResponse.json(
      { 
        message: 'Candidate application submitted successfully',
        applicationStatus: 'pending'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in candidate application:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
