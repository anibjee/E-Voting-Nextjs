import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { jwtAuthMiddleware, checkAdminRole } from '@/lib/jwt';

// GET - Get all candidate applications (Admin only)
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

    const { userId } = authResult;

    // Check if user has admin role
    if (!(await checkAdminRole(userId))) {
      return NextResponse.json(
        { message: 'user does not have admin role' },
        { status: 403 }
      );
    }

    // Find all candidate applications
    const applications = await User.find(
      { isCandidateApplicant: true },
      'name age aadharCardNumber candidateParty candidateManifesto candidateApplicationStatus candidateAppliedAt candidateApprovedAt'
    ).sort({ candidateAppliedAt: -1 });

    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error('Error fetching candidate applications:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
