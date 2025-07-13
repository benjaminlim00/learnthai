"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"

import { VocabularyWord } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ReviewPage() {
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showTranslation, setShowTranslation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"all" | "new" | "learning" | "mastered">(
    "all"
  )

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchWords()
    }
  }, [user, filter])

  const fetchWords = async () => {
    if (!user) return

    try {
      const params = new URLSearchParams()
      if (filter !== "all") {
        params.append("status", filter)
      }

      const response = await fetch(`/api/vocabulary?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch words")
      }

      setWords(data.words)
      setCurrentWordIndex(0)
      setShowTranslation(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateWordStatus = async (
    wordId: string,
    newStatus: "new" | "learning" | "mastered"
  ) => {
    try {
      const response = await fetch("/api/vocabulary", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: wordId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update word status")
      }

      // Update local state
      setWords((prevWords) =>
        prevWords.map((word) =>
          word.id === wordId ? { ...word, status: newStatus } : word
        )
      )
    } catch (error) {
      console.error("Error updating word status:", error)
    }
  }

  const nextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % words.length)
    setShowTranslation(false)
  }

  const previousWord = () => {
    setCurrentWordIndex((prev) => (prev - 1 + words.length) % words.length)
    setShowTranslation(false)
  }

  const handleStatusUpdate = async (
    newStatus: "new" | "learning" | "mastered"
  ) => {
    if (words.length === 0) return

    await updateWordStatus(words[currentWordIndex].id, newStatus)
    nextWord()
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vocabulary...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Review Vocabulary
          </h2>
          <p className="text-muted-foreground">
            Test your knowledge with spaced repetition learning
          </p>
        </div>

        {error && (
          <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filter Words</CardTitle>
              <div className="text-sm text-muted-foreground">
                {words.length > 0 && (
                  <span>
                    {currentWordIndex + 1} of {words.length}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Select
                  value={filter}
                  onValueChange={(value) =>
                    setFilter(value as "all" | "new" | "learning" | "mastered")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Words</SelectItem>
                    <SelectItem value="new">New Words</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="mastered">Mastered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {words.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No words found for the selected filter.
                </p>
                <Button
                  onClick={() => {
                    window.location.href = "/topic"
                  }}
                  className="mx-auto"
                >
                  Generate Vocabulary
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {words[currentWordIndex]?.word}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {words[currentWordIndex]?.word}
                  </div>
                  {words[currentWordIndex]?.word_romanization && (
                    <div className="text-lg text-muted-foreground italic mb-4">
                      {words[currentWordIndex]?.word_romanization}
                    </div>
                  )}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setShowTranslation(!showTranslation)}
                      variant="outline"
                    >
                      {showTranslation ? "Hide" : "Show"} Translation
                    </Button>
                  </div>
                </div>

                {showTranslation && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        Translation: {words[currentWordIndex]?.translation}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Example:
                      </p>
                      <p className="text-foreground mb-2">
                        {words[currentWordIndex]?.sentence}
                      </p>
                      {words[currentWordIndex]?.sentence_romanization && (
                        <p className="text-sm text-muted-foreground italic mb-2">
                          {words[currentWordIndex]?.sentence_romanization}
                        </p>
                      )}
                      {words[currentWordIndex]?.sentence_translation && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Translation:</span>{" "}
                          {words[currentWordIndex]?.sentence_translation}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Button onClick={previousWord} variant="outline">
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusUpdate("new")}
                      variant={
                        words[currentWordIndex]?.status === "new"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                    >
                      New
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate("learning")}
                      variant={
                        words[currentWordIndex]?.status === "learning"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                    >
                      Learning
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate("mastered")}
                      variant={
                        words[currentWordIndex]?.status === "mastered"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                    >
                      Mastered
                    </Button>
                  </div>
                  <Button onClick={nextWord} variant="outline">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
