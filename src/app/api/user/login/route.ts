import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { aadharCardNumber, password } = await request.json();
    console.log('🔑 Login attempt for Aadhar:', aadharCardNumber);

    // Check if aadharCardNumber or password is missing
    if (!aadharCardNumber || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json(
        { error: 'Aadhar Card Number and password are required' },
        { status: 400 }
      );
    }

    // Find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber });
    console.log('👤 User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('❌ User not found with Aadhar:', aadharCardNumber);
      return NextResponse.json(
        { error: 'Invalid Aadhar Card Number or Password' },
        { status: 401 }
      );
    }

    // Check password
    const passwordMatch = await user.comparePassword(password);
    console.log('🔐 Password match:', passwordMatch ? 'Yes' : 'No');
    
    if (!passwordMatch) {
      console.log('❌ Invalid password for user:', aadharCardNumber);
      return NextResponse.json(
        { error: 'Invalid Aadhar Card Number or Password' },
        { status: 401 }
      );
    }

    // Generate token
    const payload = {
      id: (user._id as any).toString(),
    };
    const token = generateToken(payload);

    // Return token and role as response
    return NextResponse.json(
      { token, role: user.role },
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
