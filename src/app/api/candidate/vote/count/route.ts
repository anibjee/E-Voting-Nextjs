import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Candidate from '@/models/Candidate';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Find all candidates and sort them by voteCount in descending order
    const candidates = await Candidate.find().sort({ voteCount: -1 });

    // Map the candidates to only return their party and voteCount
    const voteRecord = candidates.map((data) => ({
      party: data.party,
      voteCount: data.voteCount,
    }));

    return NextResponse.json(voteRecord, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
