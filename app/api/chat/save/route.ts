import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { userId, messages } = await request.json()

    if (!userId || !messages) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if a chat history exists for this user
    const { data: existingChat } = await supabase.from("chat_history").select("id").eq("user_id", userId).limit(1)

    if (existingChat && existingChat.length > 0) {
      // Update existing chat history
      const { error } = await supabase
        .from("chat_history")
        .update({ messages, updated_at: new Date().toISOString() })
        .eq("id", existingChat[0].id)

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 })
      }
    } else {
      // Create new chat history
      const { error } = await supabase.from("chat_history").insert([
        {
          user_id: userId,
          messages,
        },
      ])

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 })
      }
    }

    return NextResponse.json({ message: "Chat history saved successfully" }, { status: 200 })
  } catch (error) {
    console.error("Save chat error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
