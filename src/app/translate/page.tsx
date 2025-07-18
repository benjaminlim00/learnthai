"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute, AudioButton } from "@/components/shared"
import { TranslateResponse } from "@/lib/validation"
import { TranslationHistory } from "@/components/translate/TranslationHistory"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Languages, History, X, Copy } from "lucide-react"

interface TranslationResult extends TranslateResponse {
  id: string
  inputText: string
  timestamp: number
}

const sampleText = "Nice to meet you, what is your name?"

const STORAGE_KEY = "learnthai-translation-history"
const MAX_HISTORY = 10

export default function TranslatePage() {
  const [inputText, setInputText] = useState("")
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

  const copyToClipboard = async () => {
    if (!translationResult?.translatedText) return

    try {
      await navigator.clipboard.writeText(translationResult.translatedText)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
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
      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
          {/* Header Bar */}
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

          <CardContent className="p-6 pt-0">
            {/* Translation Areas */}
            <div
              className={`grid gap-4 ${
                translationResult ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Enter text
                  </Label>
                </div>
                <div className="relative">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={sampleText}
                    className="min-h-[120px] resize-none border-2 focus:border-primary pr-12 scrollbar-hide"
                  />
                  {inputText && (
                    <Button
                      onClick={() => setInputText("")}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-3 h-6 w-6 p-0 hover:bg-muted z-10"
                      title="Clear text"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Output Area - Only show when there's a translation */}
              {translationResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Translation
                    </Label>
                    <Button
                      onClick={copyToClipboard}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-muted"
                      title="Copy translation"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="min-h-[120px] p-3 bg-muted/50 border-2 rounded-md">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-foreground text-base leading-relaxed">
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
                  </div>
                </div>
              )}
            </div>

            {/* Translate Button */}
            <Button
              onClick={translate}
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? <>Translating...</> : "Translate"}
            </Button>
            {/* Error Display */}
            {error && (
              <div className="mt-4 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        {translationResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Usage Examples */}
            <Card>
              <CardContent>
                <h3 className="font-semibold mb-3">Usage</h3>
                <ul className="space-y-2">
                  {translationResult.usage.map((usage, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start"
                    >
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 mt-2 mr-2 flex-shrink-0"></span>
                      {usage}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Example Sentences */}
            <Card>
              <CardContent>
                <h3 className="font-semibold mb-3">Example Sentences</h3>
                <div className="space-y-3">
                  {translationResult.exampleSentences
                    .slice(0, 2)
                    .map((example, index) => (
                      <div
                        key={index}
                        className="space-y-2 p-3 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <p className="text-md font-medium">
                              {example.text}
                            </p>
                            {example.romanization && (
                              <p className="text-xs text-muted-foreground">
                                {example.romanization}
                              </p>
                            )}
                          </div>
                          <AudioButton
                            text={example.text}
                            contentType="sentence"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground border-t border-border pt-1">
                          {example.translation}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
