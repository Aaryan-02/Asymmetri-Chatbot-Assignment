import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ChatInterface from "@/components/chat-interface"
import { createClient } from "@supabase/supabase-js"

export default async function ChatPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get user's chat history
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: chatHistory } = await supabase
    .from("chat_history")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(1)

  const initialMessages = chatHistory?.[0]?.messages || []

  return (
    <div className="flex h-screen bg-slate-50">
      <ChatInterface userId={session.user.id} initialMessages={initialMessages} />
    </div>
  )
}
