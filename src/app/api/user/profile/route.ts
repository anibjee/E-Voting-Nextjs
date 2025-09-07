import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { jwtAuthMiddleware } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await jwtAuthMiddleware(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    
    return NextResponse.json(
      { 
        user: {
          id: user._id,
          name: user.name,
          age: user.age,
          email: user.email,
          mobile: user.mobile,
          address: user.address,
          aadharCardNumber: user.aadharCardNumber,
          role: user.role,
          isVoted: user.isVoted,
          // Candidacy fields
          isCandidateApplicant: user.isCandidateApplicant || false,
          candidateApplicationStatus: user.candidateApplicationStatus || 'none',
          candidateParty: user.candidateParty,
          candidateManifesto: user.candidateManifesto,
          candidateAppliedAt: user.candidateAppliedAt,
          candidateApprovedAt: user.candidateApprovedAt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
