import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { checkGoogleRanking } from "@/lib/dataforseo";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchPhrase, location, url } = await req.json();

    if (!searchPhrase || !location || !url) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Make DataForSEO API call
    let rankPosition = null;
    try {
      const rankingData = await checkGoogleRanking(searchPhrase, url);
      console.log('DataForSEO API response:', rankingData);
      
      if (rankingData?.tasks?.[0]?.result?.[0]?.items?.[0]?.rank_absolute) {
        rankPosition = rankingData.tasks[0].result[0].items[0].rank_absolute;
      }
    } catch (error) {
      console.error('Failed to check ranking:', error);
      // Continue with URL creation even if ranking check fails
    }

    // Create tracked URL
    const trackedUrl = await prisma.trackedUrl.create({
      data: {
        searchPhrase,
        location,
        url,
        userId: user.id,
      },
    });

    return NextResponse.json({
      ...trackedUrl,
      rankPosition,
    });
  } catch (error) {
    console.error("Create tracked URL error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trackedUrls: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user.trackedUrls);
  } catch (error) {
    console.error("Get tracked URLs error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 