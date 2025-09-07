import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';
import User from '@/models/User';
import { jwtAuthMiddleware } from '@/lib/jwt';
import mongoose from 'mongoose';

// GET - Vote for a candidate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
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
    const resolvedParams = await params;
    const candidateId = resolvedParams.candidateId;

    // Find the Candidate document with the specified candidateID
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return NextResponse.json(
        { message: 'Candidate not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'user not found' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { message: 'admin is not allowed' },
        { status: 403 }
      );
    }

    if (user.isVoted) {
      return NextResponse.json(
        { message: 'You have already voted' },
        { status: 400 }
      );
    }

    // Check if user is an approved candidate (candidates cannot vote)
    if (user.candidateApplicationStatus === 'approved') {
      return NextResponse.json(
        { message: 'Candidates cannot vote in the election' },
        { status: 403 }
      );
    }

    // Update the Candidate document to record the vote
    candidate.votes.push({ user: new mongoose.Types.ObjectId(userId), votedAt: new Date() });
    candidate.voteCount++;
    await candidate.save();

    // Update the user document
    user.isVoted = true;
    await user.save();

    return NextResponse.json(
      { message: 'Vote recorded successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
