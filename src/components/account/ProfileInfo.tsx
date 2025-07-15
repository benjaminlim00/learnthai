"use client"

import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { UserProfile } from "@/types/database"

interface ProfileInfoProps {
  user: User | null
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Fetch user profile on component mount
  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/profile")

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setSelectedSpeaker(data.profile.speaker_preference)
      } else {
        console.error("Failed to fetch profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSpeaker = async () => {
    if (!selectedSpeaker || selectedSpeaker === profile?.speaker_preference) {
      return
    }

    try {
      setUpdating(true)
      setMessage("")
      setError("")

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          speaker_preference: selectedSpeaker,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setMessage("Gender preference updated successfully!")
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000)
      } else {
        setError(data.error || "Failed to update gender preference")
      }
    } catch (error) {
      console.error("Error updating gender:", error)
      setError("An error occurred while updating your preference")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-foreground">{user?.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Member since
            </p>
            <p className="text-foreground">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Speaker Preference
            </p>
            {loading ? (
              <div className="h-5 bg-muted rounded animate-pulse w-32" />
            ) : (
              <div className="space-y-1 mt-1">
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedSpeaker}
                    onValueChange={setSelectedSpeaker}
                  >
                    <SelectTrigger className="w-24 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedSpeaker !== profile?.speaker_preference && (
                    <Button
                      onClick={updateSpeaker}
                      disabled={updating}
                      size="sm"
                      variant="outline"
                      className="text-xs px-2"
                    >
                      {updating ? "..." : "Save"}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Affects vocabulary examples and TTS voice
                </p>

                {message && <p className="text-xs text-green-600">{message}</p>}

                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
