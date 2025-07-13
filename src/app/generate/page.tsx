"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { GPTVocabularyWord } from "@/lib/validation"

interface UsageStats {
  dailyUsed: number
  dailyLimit: number
  resetTime: string
}

export default function GeneratePage() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [usageStats, setUsageStats] = useState<UsageStats>({
    dailyUsed: 0,
    dailyLimit: 5,
    resetTime: "midnight (UTC)",
  })
  const [vocabularyWords, setVocabularyWords] = useState<GPTVocabularyWord[]>(
    []
  )
  const [error, setError] = useState("")

  const { user } = useAuth()

  const characterCount = topic.length
  const characterLimit = 200
  const remainingGenerations = usageStats.dailyLimit - usageStats.dailyUsed

  useEffect(() => {
    if (user) {
      fetchUsageStats()
    }
  }, [user])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch("/api/generation-stats")
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data)
      }
    } catch (error) {
      console.error("Error fetching usage stats:", error)
    }
  }

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= characterLimit) {
      setTopic(value)
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!topic.trim()) {
      setError("Please enter a topic")
      return
    }

    if (remainingGenerations <= 0) {
      setError(
        "You've reached your daily generation limit. Try again tomorrow!"
      )
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/generate-vocab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      })

      const data = await response.json()

      if (response.ok) {
        setVocabularyWords(data.vocabWords)
        setTopic("")
        fetchUsageStats() // Refresh usage stats
      } else {
        setError(data.error || "Failed to generate vocabulary")
      }
    } catch (error) {
      console.error("Error generating vocabulary:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const saveWord = async (word: GPTVocabularyWord) => {
    try {
      const response = await fetch("/api/vocabulary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(word),
      })

      if (response.ok) {
        // Remove the saved word from the list
        setVocabularyWords((prev) => prev.filter((w) => w.word !== word.word))
      } else {
        console.error("Failed to save word")
      }
    } catch (error) {
      console.error("Error saving word:", error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Generate Vocabulary
          </h2>
          <p className="text-muted-foreground">
            Enter a topic to generate Thai vocabulary words with pronunciations
            and example sentences
          </p>
        </div>

        {/* Usage Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {usageStats.dailyUsed} / {usageStats.dailyLimit} generations
                  used today
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Resets at {usageStats.resetTime}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">
                  {remainingGenerations}
                </p>
                <p className="text-sm text-muted-foreground">remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generation Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={handleTopicChange}
                  placeholder="e.g., food, travel, family, daily activities..."
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                  disabled={loading || remainingGenerations <= 0}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">
                    {characterCount} / {characterLimit} characters
                  </p>
                  {characterCount > characterLimit * 0.9 && (
                    <p className="text-sm text-orange-600">
                      Approaching character limit
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !topic.trim() || remainingGenerations <= 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  "Generate Vocabulary"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Vocabulary */}
        {vocabularyWords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Vocabulary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vocabularyWords.map((word, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-card">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {word.word}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {word.word_romanization}
                        </p>
                      </div>
                      <Button
                        onClick={() => saveWord(word)}
                        variant="outline"
                        size="sm"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-foreground font-medium mb-2">
                      {word.translation}
                    </p>
                    <div className="border-t pt-2">
                      <p className="text-foreground mb-1">{word.sentence}</p>
                      <p className="text-sm text-muted-foreground mb-1">
                        {word.sentence_romanization}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {word.sentence_translation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
