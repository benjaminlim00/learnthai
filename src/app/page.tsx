"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Home() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const { user, signIn, signUp, signInWithMagicLink } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push("/topic")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      if (isSignUp) {
        await signUp(email, password)
        setMessage("Check your email for a confirmation link!")
      } else {
        await signIn(email, password)
        router.push("/topic")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      await signInWithMagicLink(email)
      setMessage("Check your email for a magic link!")
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Don't render anything if user is authenticated and we're redirecting
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            LearnThaiAI
          </h1>
          <p className="text-muted-foreground">
            AI-powered Thai language learning made simple
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex mb-2">
              <Button
                variant={!isSignUp ? "default" : "outline"}
                onClick={() => setIsSignUp(false)}
                className="flex-1 rounded-r-none"
              >
                Sign In
              </Button>
              <Button
                variant={isSignUp ? "default" : "outline"}
                onClick={() => setIsSignUp(true)}
                className="flex-1 rounded-l-none"
              >
                Sign Up
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              {message && (
                <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  {message}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <Button
                onClick={handleMagicLink}
                disabled={loading || !email}
                variant="outline"
                className="mt-4 w-full"
              >
                Sign in with Magic Link
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By signing up, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
