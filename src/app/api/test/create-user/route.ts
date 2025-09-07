import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Create a test admin user
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Test Admin',
        age: 30,
        aadharCardNumber: 999999999999,
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Test admin user created');
    }
    
    // Create a test voter user
    const existingVoter = await User.findOne({ aadharCardNumber: 123456789012 });
    if (!existingVoter) {
      const voterUser = new User({
        name: 'Test Voter',
        age: 25,
        aadharCardNumber: 123456789012,
        password: 'voter123',
        role: 'voter'
      });
      await voterUser.save();
      console.log('Test voter user created');
    }
    
    return NextResponse.json(
      { message: 'Test users created successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating test users:', error);
    return NextResponse.json(
      { error: 'Failed to create test users' },
      { status: 500 }
    );
  }
}
