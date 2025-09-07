import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const data = await request.json();
    const { name, age, email, mobile, address, aadharCardNumber, password, role } = data;

    // Check if there is already an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (role === 'admin' && adminUser) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      );
    }

    // Validate Aadhar Card Number must have exactly 12 digits
    if (!/^\d{12}$/.test(aadharCardNumber.toString())) {
      return NextResponse.json(
        { error: 'Aadhar Card Number must be exactly 12 digits' },
        { status: 400 }
      );
    }

    // Check if a user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({ aadharCardNumber });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with the same Aadhar Card Number already exists' },
        { status: 400 }
      );
    }

    // Create a new User document
    const newUser = new User({
      name,
      age,
      email,
      mobile,
      address,
      aadharCardNumber,
      password,
      role
    });

    // Save the new user to the database
    const response = await newUser.save();
    console.log('User data saved');

    const payload = {
      id: (response._id as any).toString()
    };
    
    const token = generateToken(payload);

    return NextResponse.json(
      { 
        response: {
          id: response._id,
          name: response.name,
          age: response.age,
          email: response.email,
          mobile: response.mobile,
          address: response.address,
          aadharCardNumber: response.aadharCardNumber,
          role: response.role,
          isVoted: response.isVoted
        },
        token 
      },
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
