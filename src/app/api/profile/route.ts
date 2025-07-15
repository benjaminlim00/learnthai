import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import {
  withAuthAndValidation,
  errorResponse,
  successResponse,
} from "@/lib/middleware"
import { z } from "zod"
import { User } from "@supabase/supabase-js"
import { UserProfile } from "@/types/database"

// Schema for updating profile
const updateProfileSchema = z.object({
  speaker_preference: z.enum(["male", "female"]),
})

type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// GET - Get user profile
const getProfileHandler = async (request: NextRequest, user: User) => {
  try {
    const supabase = await createServerSupabaseClient(request)

    // Use the database function to get or create profile
    const { data, error } = await supabase.rpc("get_or_create_user_profile", {
      user_uuid: user.id,
    })

    if (error) {
      console.error("Error fetching user profile:", error)
      return errorResponse("Failed to fetch profile", 500)
    }

    if (!data || data.length === 0) {
      return errorResponse("Profile not found", 404)
    }

    const profile: UserProfile = data[0]
    return successResponse({ profile })
  } catch (error) {
    console.error("Error in getProfileHandler:", error)
    return errorResponse("Internal server error", 500)
  }
}

// PUT - Update user profile
const updateProfileHandler = withAuthAndValidation(
  async (
    request: NextRequest,
    user: User,
    validatedData: UpdateProfileInput
  ) => {
    try {
      const { speaker_preference } = validatedData
      const supabase = await createServerSupabaseClient(request)

      // Use the database function to update speaker preference and voice
      const { data, error } = await supabase.rpc(
        "update_user_speaker_preference",
        {
          user_uuid: user.id,
          new_speaker_preference: speaker_preference,
        }
      )

      if (error) {
        console.error("Error updating user profile:", error)
        return errorResponse("Failed to update profile", 500)
      }

      if (!data || data.length === 0) {
        return errorResponse("Failed to update profile", 500)
      }

      const updatedProfile: UserProfile = data[0]
      return successResponse({
        profile: updatedProfile,
        message: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error in updateProfileHandler:", error)
      return errorResponse("Internal server error", 500)
    }
  },
  updateProfileSchema
)

export async function GET(request: NextRequest) {
  // Simple auth check without validation since GET doesn't need body validation
  try {
    const supabase = await createServerSupabaseClient(request)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return errorResponse("Unauthorized", 401)
    }

    return getProfileHandler(request, user)
  } catch (error) {
    console.error("Error in GET /api/profile:", error)
    return errorResponse("Internal server error", 500)
  }
}

export async function PUT(request: NextRequest) {
  return updateProfileHandler(request)
}
