import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title, tagIds } = body;

    const savedLink = await prisma.savedLink.create({
      data: {
        url,
        title,
        tags: {
          connect: tagIds.map((id: string) => ({ id })),
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(savedLink);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save link' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const links = await prisma.savedLink.findMany({
      include: {
        tags: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Tweet ID is required' },
        { status: 400 }
      );
    }

    await prisma.savedLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tweet:', error);
    return NextResponse.json(
      { error: 'Failed to delete tweet' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { tagIds } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Tweet ID is required' },
        { status: 400 }
      );
    }

    const updatedLink = await prisma.savedLink.update({
      where: { id },
      data: {
        tags: {
          set: tagIds.map((id: string) => ({ id })),
        },
      },
      include: {
        tags: {
          include: {
            parent: true,
          },
        },
      },
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating tweet tags:', error);
    return NextResponse.json(
      { error: 'Failed to update tweet tags' },
      { status: 500 }
    );
  }
} 