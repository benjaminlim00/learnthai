import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { withAuth, errorResponse, successResponse } from "@/lib/middleware"
import { User } from "@supabase/supabase-js"
import { PronunciationAnalysisService } from "@/lib/services/pronunciation-analysis"
import { PronunciationSession } from "@/types/pronunciation"

// GET - Get pronunciation weakness analysis
export const GET = withAuth(async (request: NextRequest, user: User) => {
  try {
    const url = new URL(request.url)
    const daysBack = parseInt(url.searchParams.get("days") || "30")

    // Validate parameters
    if (daysBack < 1 || daysBack > 365) {
      return errorResponse("Days parameter must be between 1 and 365", 400)
    }

    const supabase = await createServerSupabaseClient(request)

    // Get raw pronunciation session data
    const { data, error } = await supabase.rpc(
      "get_user_pronunciation_sessions",
      {
        user_uuid: user.id,
        days_back: daysBack,
      }
    )

    if (error) {
      console.error("Error getting pronunciation sessions:", error)
      return errorResponse("Failed to get pronunciation data", 500)
    }

    const sessions: PronunciationSession[] = data || []

    const analysisData =
      await PronunciationAnalysisService.analyzeUserPronunciation(sessions)

    return successResponse({ ...analysisData })
  } catch (error) {
    console.error("Error in pronunciation analysis GET:", error)
    return errorResponse("Internal server error", 500)
  }
})
