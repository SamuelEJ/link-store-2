import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title, category } = body;

    const savedLink = await prisma.savedLink.create({
      data: {
        url,
        title,
        category,
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