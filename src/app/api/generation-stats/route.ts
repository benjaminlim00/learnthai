import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { withAuth, errorResponse, successResponse } from "@/lib/middleware"
import { User } from "@supabase/supabase-js"

// GET - Get generation statistics for the authenticated user
const getGenerationStatsHandler = withAuth(
  async (request: NextRequest, user: User) => {
    try {
      const supabase = await createServerSupabaseClient(request)

      // Get today's date range
      const today = new Date()
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      )

      // Count today's generations
      const { data: dailyUsage, error: usageError } = await supabase
        .from("generation_logs")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .gte("created_at", startOfDay.toISOString())
        .lt("created_at", endOfDay.toISOString())

      if (usageError) {
        console.error("Error fetching generation stats:", usageError)
        return errorResponse("Failed to fetch generation statistics", 500)
      }

      const dailyUsed = dailyUsage?.length || 0
      const dailyLimit = 5

      // Calculate next reset time (midnight UTC)
      const nextReset = new Date()
      nextReset.setUTCHours(24, 0, 0, 0)

      return successResponse({
        dailyUsed,
        dailyLimit,
        remaining: dailyLimit - dailyUsed,
        resetTime: "midnight (UTC)",
        nextReset: nextReset.toISOString(),
      })
    } catch (error) {
      console.error("Error in generation stats handler:", error)
      return errorResponse("Internal server error", 500)
    }
  }
)

export const GET = getGenerationStatsHandler
