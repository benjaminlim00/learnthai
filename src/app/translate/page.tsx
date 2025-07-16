"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute, LoadingSpinner } from "@/components/shared"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown, Languages, History, X } from "lucide-react"

type LanguageDirection = "en-th" | "th-en"

interface TranslationResult {
  id: string
  inputText: string
  translatedText: string
  romanization?: string
  direction: LanguageDirection
  timestamp: number
}

const sampleTexts = {
  "en-th": "Hello, how are you today? I hope you're having a wonderful day!",
  "th-en": "สวัสดีครับ วันนี้เป็นอย่างไรบ้าง? หวังว่าคุณจะมีวันที่ดีนะครับ!",
}

const STORAGE_KEY = "learnthai-translation-history"
const MAX_HISTORY = 10

export default function TranslatePage() {
  const [inputText, setInputText] = useState(sampleTexts["en-th"])
  const [translatedText, setTranslatedText] = useState("")
  const [romanization, setRomanization] = useState("")
  const [direction, setDirection] = useState<LanguageDirection>("en-th")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<TranslationResult[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useAuth() // Authentication is handled by ProtectedRoute

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY)
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setHistory(parsed)
      } catch (error) {
        console.error("Error parsing translation history:", error)
      }
    }
  }, [])

  // Save translation to history
  const saveToHistory = (
    result: Omit<TranslationResult, "id" | "timestamp">
  ) => {
    const newResult: TranslationResult = {
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

  // Load translation from history
  const loadFromHistory = (result: TranslationResult) => {
    setInputText(result.inputText)
    setTranslatedText(result.translatedText)
    setRomanization(result.romanization || "")
    setDirection(result.direction)
    setError("")
    setShowHistory(false)
  }

  const swapDirection = () => {
    const newDirection: LanguageDirection =
      direction === "en-th" ? "th-en" : "en-th"
    setDirection(newDirection)
    setInputText(sampleTexts[newDirection])
    setTranslatedText("")
    setRomanization("")
    setError("")
  }

  const translate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to translate")
      return
    }

    setLoading(true)
    setError("")
    setTranslatedText("")
    setRomanization("")

    try {
      const [sourceLanguage, targetLanguage] =
        direction === "en-th" ? ["English", "Thai"] : ["Thai", "English"]

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          sourceLanguage,
          targetLanguage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Translation failed")
      }

      setTranslatedText(data.translatedText)
      if (data.romanization) {
        setRomanization(data.romanization)
      }

      // Save to history
      saveToHistory({
        inputText,
        translatedText: data.translatedText,
        romanization: data.romanization,
        direction,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getLanguageLabel = (dir: LanguageDirection) => {
    return dir === "en-th" ? "English → Thai" : "Thai → English"
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
            <Languages className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              Thai Translator
            </h2>
          </div>
          <p className="text-muted-foreground">
            Translate between Thai and English using AI-powered translation
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Translation Direction</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <History className="h-4 w-4" />
                  History ({history.length})
                </Button>
                <Button
                  onClick={swapDirection}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Swap
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="direction">Language Direction</Label>
                <Select
                  value={direction}
                  onValueChange={(value: LanguageDirection) => {
                    setDirection(value)
                    setInputText(sampleTexts[value])
                    setTranslatedText("")
                    setRomanization("")
                    setError("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-th">English → Thai</SelectItem>
                    <SelectItem value="th-en">Thai → English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="input-text">
                  {direction === "en-th" ? "English Text" : "Thai Text"}
                </Label>
                <Textarea
                  id="input-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Enter ${
                    direction === "en-th" ? "English" : "Thai"
                  } text to translate...`}
                />
              </div>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                onClick={translate}
                disabled={loading || !inputText.trim()}
                className="w-full"
              >
                {loading ? "Translating..." : "Translate"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History Section */}
        {showHistory && history.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Translation History</CardTitle>
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
                          {getLanguageLabel(result.direction)} •{" "}
                          {formatDate(result.timestamp)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {result.inputText}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.translatedText}
                        </p>
                        {result.romanization && (
                          <p className="text-xs text-muted-foreground font-mono line-clamp-1">
                            {result.romanization}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(translatedText || loading) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {direction === "en-th"
                  ? "Thai Translation"
                  : "English Translation"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner text="Translating your text..." />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="text-foreground whitespace-pre-wrap">
                      {translatedText}
                    </p>
                  </div>

                  {romanization && (
                    <div className="p-4 bg-muted/30 rounded-md border border-dashed border-muted-foreground/20">
                      <p className="text-xs text-muted-foreground mb-1">
                        Romanization:
                      </p>
                      <p className="text-foreground font-mono text-sm whitespace-pre-wrap">
                        {romanization}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {getLanguageLabel(direction)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
