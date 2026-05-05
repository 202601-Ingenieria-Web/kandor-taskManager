import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { user } = await request.json();

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
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  } else {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
  }
}
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const { user } = await request.json();

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: user.name,
        image: user.image,
        email: user.email,
        role: user.role,
        enabled: user.enabled,
      },
    });
    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  } else {
    try {
      await prisma.user.delete({
        where: {
          id: userId,
        },
      });
      return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  }
}
