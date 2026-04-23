import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { user } = await request.json();
  console.log('user :>> ', user);
  try {
    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        image: user.image,
        email: user.email,
        role: user.role,
      },
    });
    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Here you would typically handle the user creation logic, such as validating the input,
// hashing the password, and saving the user to a database. For this example, we'll just return the user data as a response.
