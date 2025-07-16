"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute, LoadingState } from "@/components/shared"
import {
  ProfileInfo,
  LearningStats,
  GenerationUsage,
  TranslationUsage,
  FeatureList,
  AccountActions,
} from "@/components/account"
import { VocabularyWord } from "@/types/database"

interface GenerationStats {
  dailyUsed: number
  dailyLimit: number
  remaining: number
  resetTime: string
  nextReset: string
}

export default function AccountPage() {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    learning: 0,
    mastered: 0,
  })
  const [generationStats, setGenerationStats] = useState<GenerationStats>({
    dailyUsed: 0,
    dailyLimit: 5,
    remaining: 5,
    resetTime: "midnight (UTC)",
    nextReset: "",
  })
  const [loading, setLoading] = useState(true)

  const { user, signOut } = useAuth()

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchGenerationStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/vocabulary`)
      const data = await response.json()

      if (response.ok) {
        const words: VocabularyWord[] = data.words
        setStats({
          total: words.length,
          new: words.filter((w) => w.status === "new").length,
          learning: words.filter((w) => w.status === "learning").length,
          mastered: words.filter((w) => w.status === "mastered").length,
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGenerationStats = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/generation-stats`)
      const data = await response.json()

      if (response.ok) {
        setGenerationStats(data)
      }
    } catch (error) {
      console.error("Error fetching generation stats:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <LoadingState variant="page" text="Loading account..." />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Account Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your account and view your learning progress
          </p>
        </div>

        <ProfileInfo user={user} />
        <LearningStats stats={stats} />
        <GenerationUsage generationStats={generationStats} />
        <TranslationUsage />
        <FeatureList />
        <AccountActions onSignOut={handleSignOut} />
      </div>
    </ProtectedRoute>
  )
}
