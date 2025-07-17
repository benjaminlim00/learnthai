"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  ProtectedRoute,
  LoadingSpinner,
  AudioButton,
} from "@/components/shared"
import { TranslateResponse } from "@/lib/validation"
import { TranslationHistory } from "@/components/translate/TranslationHistory"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Languages, History } from "lucide-react"

interface TranslationResult extends TranslateResponse {
  id: string
  inputText: string
  timestamp: number
}

const sampleText = "Nice to meet you, what is your name?"

const STORAGE_KEY = "learnthai-translation-history"
const MAX_HISTORY = 10

export default function TranslatePage() {
  const [inputText, setInputText] = useState(sampleText)
  const [translationResult, setTranslationResult] = useState<Omit<
    TranslationResult,
    "id" | "timestamp"
  > | null>(null)
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
    setTranslationResult({
      inputText: result.inputText,
      translatedText: result.translatedText,
      romanization: result.romanization,
      usage: result.usage,
      exampleSentences: result.exampleSentences,
      sourceLanguage: result.sourceLanguage,
    })
    setError("")
    setShowHistory(false)
  }

  const translate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to translate")
      return
    }

    setLoading(true)
    setError("")
    setTranslationResult(null)

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Translation failed")
      }

      const result = {
        inputText,
        ...data,
      }

      setTranslationResult(result)
      saveToHistory(result)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
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
            Translate between Thai and English with examples and usage
            information
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Translation</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter text in English or Thai - AI will automatically detect
                  the language and translate it for you
                </p>
              </div>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input-text">Enter Text</Label>
                <Textarea
                  id="input-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={translate} disabled={loading} className="w-full">
                {loading ? <>Translating...</> : "Translate"}
              </Button>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              {translationResult && (
                <div className="space-y-6 pt-4">
                  {/* Translation Result */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Translation</h3>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-foreground">
                            {translationResult.translatedText}
                          </p>
                          {translationResult.romanization && (
                            <p className="text-muted-foreground text-sm mt-1">
                              {translationResult.romanization}
                            </p>
                          )}
                        </div>
                        <AudioButton
                          text={translationResult.translatedText}
                          contentType={
                            translationResult.translatedText.includes(" ")
                              ? "sentence"
                              : "word"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Usage Examples */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Usage</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {translationResult.usage.map((usage, index) => (
                        <li key={index} className="text-muted-foreground">
                          {usage}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Example Sentences */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Example Sentences</h3>
                    <div className="space-y-4">
                      {translationResult.exampleSentences.map(
                        (example, index) => (
                          <div
                            key={index}
                            className="bg-muted p-3 rounded-md space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-foreground">
                                  {example.text}
                                </p>
                                {example.romanization && (
                                  <p className="text-muted-foreground text-sm">
                                    {example.romanization}
                                  </p>
                                )}
                              </div>
                              <AudioButton
                                text={example.text}
                                contentType="sentence"
                              />
                            </div>
                            <div className="border-t border-border pt-2">
                              <p className="text-muted-foreground flex-1">
                                {example.translation}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showHistory && (
          <TranslationHistory
            history={history}
            showHistory={showHistory}
            onToggleHistory={() => setShowHistory(false)}
            onClearHistory={clearHistory}
            onLoadFromHistory={loadFromHistory}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
