import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';
import { jwtAuthMiddleware, checkAdminRole } from '@/lib/jwt';

// GET - Get List of all candidates with only name and party fields
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Find all candidates and select only the name, party, age, and _id fields
    const candidates = await Candidate.find({}, 'name party age _id');

    return NextResponse.json(candidates, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST - Add a new candidate (Admin only)
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

    // Check if user has admin role
    if (!(await checkAdminRole(userId))) {
      return NextResponse.json(
        { message: 'user does not have admin role' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { name, party, age } = data;

    // Create a new Candidate document
    const newCandidate = new Candidate({ name, party, age });

    // Save the new candidate to the database
    const response = await newCandidate.save();
    console.log('Candidate data saved');
    
    return NextResponse.json(
      { response },
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
