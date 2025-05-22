import Message from "@/utils/message.model";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { sender, receiver, content } = await request.json();
    
    // Validate input
    if (!sender || !receiver || !content) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    
    // Save message to the database
    try {
        const newMessage = new Message({
        sender,
        receiver,
        content,

        });
        await newMessage.save();
        return NextResponse.json(newMessage);
    } catch (error) {
        console.error("Error saving message:", error);
        return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }
}