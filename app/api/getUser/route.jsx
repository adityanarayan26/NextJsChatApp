import User from "@/utils/user.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";

export async function GET(request) {
await dbConnect();
try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    // Fetch user from the database
    const users = await User.find({ _id: { $ne: new mongoose.Types.ObjectId(userId) } }).select("-__v -createdAt -updatedAt");
    if (!users) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Return the user data
    return NextResponse.json(users, { status: 200 });
    // return NextResponse.json({ message: "User fetched successfully" }, { status: 200 });
} catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    
}

}