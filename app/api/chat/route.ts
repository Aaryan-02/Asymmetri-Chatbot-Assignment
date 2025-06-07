import { createGroq } from "@ai-sdk/groq"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Error handler function to provide detailed error messages
function getErrorMessage(error: unknown): string {
  if (error == null) {
    return "Unknown error occurred"
  }
  if (typeof error === "string") {
    return error
  }
  if (error instanceof Error) {
    return error.message
  }
  return JSON.stringify(error)
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 })
    }

    let model
    let apiKeyEnvVar

    if (process.env.GROQ_API_KEY) {
      const groq = createGroq({
        apiKey: process.env.GROQ_API_KEY,
      })
      model = groq("llama-3.1-8b-instant")
      apiKeyEnvVar = "GROQ_API_KEY"
    } else if (process.env.OPENAI_API_KEY) {
      const { openai } = await import("@ai-sdk/openai")
      model = openai("gpt-4o")
      apiKeyEnvVar = "OPENAI_API_KEY"
    } else {
      return new Response(
        "No AI API key configured. Please add GROQ_API_KEY (free) environment variable.",
        {
          status: 500,
        },
      )
    }

    const result = streamText({
      model,
      system: `You are an expert web developer specializing in creating landing pages with HTML and CSS.
      
      When asked to create a landing page or website section:
      1. Generate a complete, self-contained HTML file with inline CSS
      2. Make the design responsive and modern using CSS Grid and Flexbox
      3. Use a professional color scheme and typography
      4. Include proper semantic HTML structure
      5. Add hover effects and smooth transitions
      6. Make it mobile-responsive with proper viewport settings
      7. Include placeholder content that makes sense for the requested page type
      8. Always wrap your code in \`\`\`html and \`\`\` tags
      9. Include comments to explain key sections of the code
      
      Your HTML should be complete and ready to use without any external dependencies.`,
      messages,
    })

    return result.toDataStreamResponse({
      getErrorMessage,
    })
  } catch (error) {
    console.error("Chat API Error:", error)

    // Return a more specific error message
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("billing")) {
        return new Response(
          `API quota exceeded. Please check your billing details or try using a different API key. Error: ${error.message}`,
          { status: 429 },
        )
      }
      return new Response(`Error: ${error.message}`, { status: 500 })
    }

    return new Response("An unexpected error occurred", { status: 500 })
  }
}
