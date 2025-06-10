import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 })
    }

   // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers()
    
    if (checkError) {
      console.error("Error checking existing users:", checkError)
      return NextResponse.json({ message: "Error checking user existence" }, { status: 500 })
    }

    const userExists = existingUsers.users.some(user => user.email === email)
    
    if (userExists) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Create user using admin API (bypasses email confirmation)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: name,
      },
    })

    if (error) {
      console.error("Supabase auth error:", error)
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ message: "Failed to create user" }, { status: 400 })
    }

    // Create user profile in database (optional, depending on your schema)
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            full_name: name,
            email: email,
          },
        ])

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // Don't fail the signup if profile creation fails
        // The user can still authenticate
      }
    } catch (profileError) {
      console.error("Profile creation failed:", profileError)
      // Continue anyway - user creation was successful
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: data.user.id,
          email: data.user.email,
          name: name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
