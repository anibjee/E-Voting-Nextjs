import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';
import { jwtAuthMiddleware, checkAdminRole } from '@/lib/jwt';

// PUT - Update candidate (Admin only)
export async function PUT(
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

    // Check if user has admin role
    if (!(await checkAdminRole(userId))) {
      return NextResponse.json(
        { message: 'user does not have admin role' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const candidateId = resolvedParams.candidateId;
    const updatedCandidateData = await request.json();

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run Mongoose validation
      }
    );

    if (!response) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    console.log('Candidate data updated');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete candidate (Admin only)
export async function DELETE(
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

    // Check if user has admin role
    if (!(await checkAdminRole(userId))) {
      return NextResponse.json(
        { message: 'user does not have admin role' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const candidateId = resolvedParams.candidateId;

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    console.log('Candidate deleted');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
