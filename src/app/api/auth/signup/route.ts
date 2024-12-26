import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("Starting signup process...");
    
    const body = await req.json();
    console.log("Received signup data:", { ...body, password: '[REDACTED]' });
    
    const { email, password, firstName, lastName, company } = body;

    if (!email || !password || !firstName || !lastName || !company) {
      console.log("Missing required fields:", {
        hasEmail: !!email,
        hasPassword: !!password,
        hasFirstName: !!firstName,
        hasLastName: !!lastName,
        hasCompany: !!company,
      });
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    console.log("Checking for existing user with email:", email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log("User already exists with email:", email);
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating new user...");
    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          company,
        },
      });

      console.log("User created successfully:", { id: user.id, email: user.email });
      return NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
      });
    } catch (dbError) {
      console.error("Database error during user creation:", dbError);
      return NextResponse.json(
        { error: "Failed to create user account. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    const err = error as Error;
    console.error("Signup error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      { error: "Something went wrong during signup. Please try again." },
      { status: 500 }
    );
  }
} 