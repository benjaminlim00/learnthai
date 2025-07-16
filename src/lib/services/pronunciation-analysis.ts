import {
  AnalysisData,
  LearningInsight,
  PronunciationSession,
  Weakness,
  ErrorType,
  ProficiencyLevel,
  ImprovementTrend,
  WeaknessPriority,
  Summary,
} from "@/types/pronunciation"

const MIN_SESSIONS_FOR_ANALYSIS = 1

export class PronunciationAnalysisService {
  static async analyzeUserPronunciation(
    sessions: PronunciationSession[]
  ): Promise<AnalysisData> {
    if (sessions.length < MIN_SESSIONS_FOR_ANALYSIS) {
      return this.createMinimalAnalysis(sessions.length)
    }

    // Analyze error patterns
    const weaknesses = this.analyzeWeaknesses(sessions)

    // Generate summary
    const summary = this.generateSummary(sessions, weaknesses)

    // Generate insights
    const learning_insights = this.generateLearningInsights(weaknesses)

    return {
      weaknesses,
      summary,
      learning_insights,
    }
  }

  private static analyzeWeaknesses(
    sessions: PronunciationSession[]
  ): Weakness[] {
    // Count error frequencies
    const errorCounts = new Map<
      ErrorType,
      { count: number; words: Set<string>; failed: number; total: number }
    >()

    sessions.forEach((session) => {
      session.errors.forEach((error) => {
        const existing = errorCounts.get(error) || {
          count: 0,
          words: new Set(),
          failed: 0,
          total: 0,
        }
        errorCounts.set(error, {
          count: existing.count + 1,
          words: existing.words.add(session.content),
          failed: existing.failed + (session.score < 70 ? 1 : 0),
          total: existing.total + 1,
        })
      })
    })

    // Convert to weaknesses array
    return Array.from(errorCounts.entries())
      .map(([error_type, data]) => {
        const frequency = data.count / sessions.length
        return {
          error_type,
          frequency,
          priority: this.calculatePriority(frequency, error_type),
          example_words: Array.from(data.words),
          failed_attempts: data.failed,
          total_attempts: data.total,
          recommendation: this.generateRecommendation(error_type),
        } as Weakness
      })
      .sort((a, b) => b.frequency - a.frequency)
  }

  //TODO: use AI to generate in future
  private static generateRecommendation(errorType: ErrorType): string {
    const recommendations: Record<ErrorType, string> = {
      tone_error:
        "Focus on tone drills and minimal pairs practice. Listen carefully to native speakers.",
      vowel_length:
        "Practice distinguishing between long and short vowels. Record yourself and compare.",
      vowel_mispronunciation:
        "Study Thai vowel charts and practice each sound in isolation.",
      aspiration:
        "Practice the difference between aspirated and unaspirated consonants.",
      consonant_error:
        "Focus on proper tongue placement and articulation points.",
      final_consonant:
        "Pay attention to final consonant sounds and practice clear endings.",
      rhythm_timing:
        "Work on rhythm and timing with slow, deliberate practice.",
      stress_pattern:
        "Study word stress patterns and practice with rhythm exercises.",
      word_boundary: "Practice clear word boundaries and natural speech flow.",
      overall_fluency:
        "Focus on speaking at a natural pace with proper rhythm.",
    }
    return recommendations[errorType]
  }

  private static calculatePriority(
    frequency: number,
    errorType: ErrorType
  ): WeaknessPriority {
    // Critical errors are tone-related or affect meaning significantly
    const criticalErrors: ErrorType[] = [
      "tone_error",
      "vowel_length",
      "consonant_error",
    ]

    if (criticalErrors.includes(errorType) && frequency > 0.5) return "critical"
    if (frequency > 0.7) return "critical"
    if (frequency > 0.4) return "high"
    if (frequency > 0.2) return "medium"
    return "low"
  }

  private static generateSummary(
    sessions: PronunciationSession[],
    weaknesses: Weakness[]
  ): Summary {
    const recentScores = sessions
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5)
      .map((s) => s.score)

    const trend = this.calculateTrend(recentScores)
    const proficiency = this.estimateProficiency(sessions)

    return {
      total_issues: weaknesses.length,
      critical_issues: weaknesses.filter((w) => w.priority === "critical")
        .length,
      high_priority_issues: weaknesses.filter((w) => w.priority === "high")
        .length,
      overall_improvement_trend: trend,
      suggested_daily_practice_time: this.suggestPracticeTime(weaknesses),
      estimated_proficiency_level: proficiency,
    }
  }

  private static calculateTrend(recentScores: number[]): ImprovementTrend {
    if (recentScores.length < 2) return "stable"

    const average = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length
    const firstHalf = average(
      recentScores.slice(0, Math.floor(recentScores.length / 2))
    )
    const secondHalf = average(
      recentScores.slice(Math.floor(recentScores.length / 2))
    )

    if (secondHalf - firstHalf > 5) return "improving"
    if (firstHalf - secondHalf > 5) return "declining"
    return "stable"
  }

  private static estimateProficiency(
    sessions: PronunciationSession[]
  ): ProficiencyLevel {
    const avgScore =
      sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length

    if (avgScore > 85) return "advanced"
    if (avgScore > 65) return "intermediate"
    return "beginner"
  }

  private static suggestPracticeTime(weaknesses: Weakness[]): number {
    const criticalCount = weaknesses.filter(
      (w) => w.priority === "critical"
    ).length
    const highCount = weaknesses.filter((w) => w.priority === "high").length

    // Base time of 10 minutes
    let suggestedTime = 10

    // Add time based on issues (2 min for critical, 1 min for high)
    suggestedTime += criticalCount * 2
    suggestedTime += highCount * 1

    // Cap at 20 minutes, minimum 10
    return Math.min(20, Math.max(10, suggestedTime))
  }

  private static createMinimalAnalysis(sessionCount: number): AnalysisData {
    return {
      weaknesses: [],
      summary: {
        total_issues: 0,
        critical_issues: 0,
        high_priority_issues: 0,
        overall_improvement_trend: "stable",
        suggested_daily_practice_time: 10,
        estimated_proficiency_level: "beginner",
      },
      learning_insights: [
        {
          type: "pattern",
          title: "More practice needed",
          description: `You have ${sessionCount} practice sessions. We need at least ${MIN_SESSIONS_FOR_ANALYSIS} sessions to provide meaningful analysis.`,
          actionable_tip:
            "Continue practicing to unlock personalized insights!",
        },
      ],
    }
  }

  private static generateLearningInsights(
    weaknesses: Weakness[]
  ): LearningInsight[] {
    //TODO: generate more insights
    if (weaknesses.length === 0) {
      return [
        {
          type: "strength",
          title: "Excellent Progress",
          description: "No significant pronunciation patterns detected",
          actionable_tip: "Continue practicing to maintain your progress",
        },
      ]
    }

    const insights: LearningInsight[] = []

    // Add critical weaknesses insight
    const criticalWeaknesses = weaknesses.filter(
      (w) => w.priority === "critical"
    )
    if (criticalWeaknesses.length > 0) {
      insights.push({
        type: "weakness",
        title: "Critical Areas Identified",
        description: `Focus on ${criticalWeaknesses[0].error_type.replace(
          "_",
          " "
        )} first`,
        actionable_tip: `Practice with these words: ${criticalWeaknesses[0].example_words.join(
          ", "
        )}`,
      })
    }

    // Add general pattern insight
    insights.push({
      type: "pattern",
      title: "Focus Areas Identified",
      description: `Found ${weaknesses.length} areas for improvement`,
      actionable_tip: "Start with high-priority items for maximum impact",
    })

    return insights
  }
}
