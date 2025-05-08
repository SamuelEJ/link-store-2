import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all tags with their hierarchy
export async function GET() {
  try {
    console.log('Fetching tags from database...');
    const tags = await prisma.tag.findMany({
      include: {
        children: true,
        parent: true,
      },
    });
    console.log('Retrieved tags:', tags);
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error in GET /api/tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Create a new tag
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, parentId } = body;

    console.log('Creating new tag:', { name, parentId });
    const tag = await prisma.tag.create({
      data: {
        name,
        parentId,
      },
      include: {
        parent: true,
        children: true,
      },
    });
    console.log('Created tag:', tag);
    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error in POST /api/tags:', error);
    return NextResponse.json(
      { error: 'Failed to create tag', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 