import { errorResponse, successResponse } from "@/lib/middleware"

// GET - Get Azure Speech token
export async function GET() {
  try {
    const speechKey = process.env.AZURE_SPEECH_KEY
    const speechRegion = process.env.AZURE_SPEECH_REGION

    if (!speechKey || !speechRegion) {
      return errorResponse(
        "Azure Speech service not configured properly in environment variables",
        500
      )
    }

    try {
      const response = await fetch(
        `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": speechKey,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Token request failed with status ${response.status}`)
      }

      const token = await response.text()
      return successResponse({
        token: token,
        region: speechRegion,
      })
    } catch (err) {
      console.error("Error getting Azure speech token:", err)
      return errorResponse("Failed to authorize speech key", 401)
    }
  } catch (error) {
    console.error("Error in Azure speech token API:", error)
    return errorResponse("Internal server error", 500)
  }
}
