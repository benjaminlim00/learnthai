"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"

import { GPTVocabularyWord } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VocabularyLoading } from "@/components/topic/vocabulary-loading"
import { BookOpen, History, X, Check } from "lucide-react"

interface UsageStats {
  dailyUsed: number
  dailyLimit: number
  resetTime: string
}

interface VocabularyResult {
  id: string
  topic: string
  vocabWords: GPTVocabularyWord[]
  timestamp: number
}

const STORAGE_KEY = "learnthai-vocabulary-history"
const MAX_HISTORY = 10

export default function TopicPage() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [vocabWords, setVocabWords] = useState<GPTVocabularyWord[]>([])
  const [error, setError] = useState("")
  const [history, setHistory] = useState<VocabularyResult[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set())
  const [savingWords, setSavingWords] = useState<Set<string>>(new Set())
  const [usageStats, setUsageStats] = useState<UsageStats>({
    dailyUsed: 0,
    dailyLimit: 5,
    resetTime: "midnight (UTC)",
  })

  const { user } = useAuth()

  const characterCount = topic.length
  const CHARACTER_LIMIT = 200
  const remainingGenerations = usageStats.dailyLimit - usageStats.dailyUsed

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY)
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setHistory(parsed)
      } catch (error) {
        console.error("Error parsing vocabulary history:", error)
      }
    }
  }, [])

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
    if (value.length <= CHARACTER_LIMIT) {
      setTopic(value)
      setError("")
    }
  }

  // Save vocabulary result to history
  const saveToHistory = (
    result: Omit<VocabularyResult, "id" | "timestamp">
  ) => {
    const newResult: VocabularyResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }

    const updatedHistory = [newResult, ...history.slice(0, MAX_HISTORY - 1)]
    setHistory(updatedHistory)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  // Load vocabulary from history
  const loadFromHistory = (result: VocabularyResult) => {
    setTopic(result.topic)
    setVocabWords(result.vocabWords)
    setError("")
    setShowHistory(false)
    // Reset saved words state when loading from history
    setSavedWords(new Set())
  }

  const generateVocab = async (e: React.FormEvent) => {
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
    setVocabWords([])
    // Reset saved words state when generating new vocabulary
    setSavedWords(new Set())

    try {
      const response = await fetch("/api/generate-vocab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate vocabulary")
      }

      setVocabWords(data.vocabWords)
      fetchUsageStats() // Refresh usage stats

      // Save to history
      saveToHistory({
        topic: topic.trim(),
        vocabWords: data.vocabWords,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const toggleSaveWord = async (word: GPTVocabularyWord) => {
    if (!user) return

    const wordKey = word.word
    const isCurrentlySaved = savedWords.has(wordKey)

    // Add to saving state
    setSavingWords((prev) => new Set(prev).add(wordKey))

    try {
      if (isCurrentlySaved) {
        // Unsave the word (DELETE request)
        const response = await fetch("/api/vocabulary", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            word: word.word,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to unsave word")
        }

        // Remove from saved words
        setSavedWords((prev) => {
          const updated = new Set(prev)
          updated.delete(wordKey)
          return updated
        })
      } else {
        // Save the word (POST request)
        const response = await fetch("/api/vocabulary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            word: word.word,
            word_romanization: word.word_romanization,
            translation: word.translation,
            sentence: word.sentence,
            sentence_romanization: word.sentence_romanization,
            sentence_translation: word.sentence_translation,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to save word")
        }

        // Add to saved words
        setSavedWords((prev) => new Set(prev).add(wordKey))
      }
    } catch (error) {
      console.error("Error toggling word save state:", error)
    } finally {
      // Remove from saving state
      setSavingWords((prev) => {
        const updated = new Set(prev)
        updated.delete(wordKey)
        return updated
      })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground ">
              Generate Thai Vocabulary
            </h2>
          </div>
          <p className="text-muted-foreground">
            Enter a topic and get AI-generated Thai vocabulary words with
            English translations and example sentences.
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

        {loading ? (
          <div className="mb-8">
            <VocabularyLoading />
          </div>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generate Vocabulary</CardTitle>
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <History className="h-4 w-4" />
                  History ({history.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={generateVocab} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <textarea
                    id="topic"
                    value={topic}
                    onChange={handleTopicChange}
                    placeholder="e.g., food, travel, family, daily activities..."
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                    disabled={loading || remainingGenerations <= 0}
                  />
                  <p className="text-sm text-muted-foreground">
                    {characterCount} / {CHARACTER_LIMIT} characters
                  </p>
                </div>

                {error && (
                  <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={
                    loading || !topic.trim() || remainingGenerations <= 0
                  }
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    "Generate Thai Vocabulary"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* History Section */}
        {showHistory && history.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Vocabulary History</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={clearHistory}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    Clear History
                  </Button>
                  <Button
                    onClick={() => setShowHistory(false)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((result) => (
                  <Card
                    key={result.id}
                    className="bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => loadFromHistory(result)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-xs text-muted-foreground">
                          {formatDate(result.timestamp)} •{" "}
                          {result.vocabWords.length} words
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          Topic: {result.topic}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {result.vocabWords.slice(0, 5).map((word, index) => (
                            <span
                              key={index}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                            >
                              {word.word}
                            </span>
                          ))}
                          {result.vocabWords.length > 5 && (
                            <span className="text-xs text-muted-foreground px-2 py-1">
                              +{result.vocabWords.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {vocabWords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Vocabulary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vocabWords.map((word, index) => {
                  const wordKey = word.word
                  const isSaved = savedWords.has(wordKey)
                  const isSaving = savingWords.has(wordKey)

                  return (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-foreground">
                              {word.word}
                            </h4>
                            {word.word_romanization && (
                              <p className="text-sm text-muted-foreground italic">
                                {word.word_romanization}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => toggleSaveWord(word)}
                            variant={isSaved ? "default" : "outline"}
                            size="sm"
                            disabled={isSaving}
                            className="gap-2"
                          >
                            {isSaving ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                {isSaved ? "Unsaving..." : "Saving..."}
                              </>
                            ) : isSaved ? (
                              <>
                                <Check className="h-4 w-4" />
                                Saved
                              </>
                            ) : (
                              "Save"
                            )}
                          </Button>
                        </div>
                        <p className="text-muted-foreground mb-3">
                          <span className="font-medium">Translation:</span>{" "}
                          {word.translation}
                        </p>
                        <div className="space-y-1">
                          <p className="text-foreground">
                            <span className="font-medium">Example:</span>{" "}
                            {word.sentence}
                          </p>
                          {word.sentence_romanization && (
                            <p className="text-sm text-muted-foreground italic">
                              {word.sentence_romanization}
                            </p>
                          )}
                          {word.sentence_translation && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Translation:</span>{" "}
                              {word.sentence_translation}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
