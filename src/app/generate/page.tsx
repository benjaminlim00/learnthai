"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/shared"

import { GPTVocabularyWord } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VocabularyLoading } from "@/components/generate/vocabulary-loading"
import { AudioButton } from "@/components/shared/AudioButton"
import { VocabularyHistory } from "@/components/generate/VocabularyHistory"
import { BookOpen, Check, History } from "lucide-react"

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

export default function GeneratePage() {
  const [mode, setMode] = useState<"topic" | "single">("topic")
  const [topic, setTopic] = useState("")
  const [word, setWord] = useState("")
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

  const currentInput = mode === "topic" ? topic : word
  const characterCount = currentInput.length
  const CHARACTER_LIMIT = mode === "topic" ? 200 : 100
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

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= CHARACTER_LIMIT) {
      setWord(value)
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
    // Check if this is a single word entry
    if (result.topic.startsWith("Single word: ")) {
      setMode("single")
      setWord(result.topic.replace("Single word: ", ""))
      setTopic("")
    } else {
      setMode("topic")
      setTopic(result.topic)
      setWord("")
    }
    setVocabWords(result.vocabWords)
    setError("")
    setShowHistory(false)
    // Reset saved words state when loading from history
    setSavedWords(new Set())
  }

  const generateVocab = async (e: React.FormEvent) => {
    e.preventDefault()

    const inputValue = mode === "topic" ? topic.trim() : word.trim()
    const inputLabel = mode === "topic" ? "topic" : "word"

    if (!inputValue) {
      setError(`Please enter a ${inputLabel}`)
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
      const requestBody = {
        mode,
        ...(mode === "topic" ? { topic: inputValue } : { word: inputValue }),
      }

      const response = await fetch("/api/generate-vocab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate vocabulary")
      }

      setVocabWords(data.vocabWords)
      fetchUsageStats() // Refresh usage stats

      // Save to history
      saveToHistory({
        topic: mode === "topic" ? inputValue : `Single word: ${inputValue}`,
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

  return (
    <ProtectedRoute>
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="flex items-center justify-center gap-2 mb-2 text-3xl font-bold text-foreground">
            <BookOpen className="h-8 w-8 text-primary" />
            Generate Thai Vocabulary
          </h1>
          <p className="text-muted-foreground">
            Generate vocabulary by topic or convert specific words into complete
            Thai vocabulary entries with translations, romanization, and example
            sentences.
          </p>
        </header>

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
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={generateVocab} className="space-y-4">
                {/* Mode Selection */}
                <div className="space-y-2">
                  <Label>Generation Mode</Label>
                  <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    <Button
                      type="button"
                      variant={mode === "topic" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMode("topic")}
                      disabled={loading || remainingGenerations <= 0}
                      className="flex-1"
                    >
                      Topic Generation
                    </Button>
                    <Button
                      type="button"
                      variant={mode === "single" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMode("single")}
                      disabled={loading || remainingGenerations <= 0}
                      className="flex-1"
                    >
                      Single Word
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mode === "topic"
                      ? "Generate multiple vocabulary words for a specific topic"
                      : "Convert a specific word (English or Thai) into a complete vocabulary entry"}
                  </p>
                </div>

                {/* Conditional Input Fields */}
                {mode === "topic" ? (
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
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="word">Word</Label>
                    <input
                      id="word"
                      type="text"
                      value={word}
                      onChange={handleWordChange}
                      placeholder="Enter a word in English or Thai..."
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={loading || remainingGenerations <= 0}
                    />
                    <p className="text-sm text-muted-foreground">
                      {characterCount} / {CHARACTER_LIMIT} characters
                    </p>
                  </div>
                )}

                {error && (
                  <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={
                    loading || !currentInput.trim() || remainingGenerations <= 0
                  }
                  className="w-full"
                >
                  {loading ? (
                    <>Generating...</>
                  ) : mode === "topic" ? (
                    "Generate Thai Vocabulary"
                  ) : (
                    "Convert Word to Thai Vocabulary"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {showHistory && (
          <VocabularyHistory
            history={history}
            showHistory={showHistory}
            onToggleHistory={() => setShowHistory(false)}
            onClearHistory={clearHistory}
            onLoadFromHistory={loadFromHistory}
          />
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
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-medium text-foreground">
                                {word.word}
                              </h4>
                              <AudioButton
                                text={word.word}
                                contentType="word"
                                size="icon"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground italic">
                              {word.word_romanization}
                            </p>
                          </div>
                          <Button
                            onClick={() => toggleSaveWord(word)}
                            variant={isSaved ? "default" : "outline"}
                            size="sm"
                            disabled={isSaving}
                            className="gap-2"
                          >
                            {isSaving ? (
                              <>{isSaved ? "Unsaving..." : "Saving..."}</>
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
                          <div className="flex items-center gap-2">
                            <p className="text-foreground">
                              <span className="font-medium">Example:</span>{" "}
                              {word.sentence}
                            </p>
                            <AudioButton
                              text={word.sentence}
                              contentType="sentence"
                              size="icon"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            {word.sentence_romanization}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Translation:</span>{" "}
                            {word.sentence_translation}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </ProtectedRoute>
  )
}
