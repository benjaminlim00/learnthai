"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Info,
  Brain,
  Target,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BarChart3,
  Zap,
  Shield,
  Clock,
  Users,
  X,
} from "lucide-react"

interface SmartCoachExplainerProps {
  onClose: () => void
}

export const SmartCoachExplainer = ({ onClose }: SmartCoachExplainerProps) => {
  const [activeSection, setActiveSection] = useState<string | null>("overview")

  const sections = [
    {
      id: "thai-analysis",
      title: "Thai-Specific Intelligence",
      icon: Zap,
      gradient: "from-amber-500 to-orange-600",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our algorithm understands unique Thai linguistic features that
            challenge English speakers, providing targeted guidance for each
            aspect.
          </p>
          <div className="grid gap-4">
            <div className="group flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-100 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-sm">5</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                  5-Tone System Analysis
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Detects tone markers (่ ้ ๊ ๋) and applies Thai tone rules
                  based on consonant classes with precision scoring
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-4 p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-100 dark:border-green-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-sm">อา</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
                  Vowel Length Recognition
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Distinguishes between short (อะ) and long (อา) vowels that
                  change word meaning completely
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl border border-orange-100 dark:border-orange-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-sm">ค</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-orange-900 dark:text-orange-100">
                  Aspiration Detection
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Identifies aspirated consonants (ค ผ ถ) vs non-aspirated (ก บ
                  ต) with breath flow analysis
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-100 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-sm">กร</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">
                  Consonant Clusters
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Analyzes complex clusters (กร คร ปร) that don&apos;t exist in
                  English phonology
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "algorithm",
      title: "Analysis Algorithm",
      icon: BarChart3,
      gradient: "from-indigo-500 to-purple-600",
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Multi-factor scoring system that weighs different aspects of
              pronunciation accuracy with advanced machine learning techniques.
            </p>
          </div>

          <div className="space-y-4">
            <div className="group p-4 border rounded-xl hover:shadow-md transition-all duration-300 bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">60</span>
                  </div>
                  <span className="text-sm font-semibold">
                    Error Pattern Analysis
                  </span>
                </div>
                <Badge variant="destructive" className="rounded-full">
                  Primary Weight
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Categorizes mistakes by Thai phonetic features and calculates
                error rates with contextual importance weighting
              </p>
            </div>

            <div className="group p-4 border rounded-xl hover:shadow-md transition-all duration-300 bg-gradient-to-r from-orange-50/50 to-yellow-50/50 dark:from-orange-950/20 dark:to-yellow-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">25</span>
                  </div>
                  <span className="text-sm font-semibold">
                    Frequency Weight
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200"
                >
                  Secondary
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                More practice attempts = higher priority for that error type,
                ensuring focused improvement
              </p>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Priority Calculation Formula
            </h4>
            <div className="font-mono text-sm bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg border backdrop-blur-sm">
              <div className="text-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  Priority
                </span>
                <span className="mx-2">=</span>
                <span className="text-red-600 dark:text-red-400">
                  (ErrorRate × 0.6)
                </span>
                <span className="mx-2">+</span>
                <span className="text-orange-600 dark:text-orange-400">
                  (FrequencyWeight × 0.25)
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "recommendations",
      title: "Smart Recommendations",
      icon: Lightbulb,
      gradient: "from-green-500 to-teal-600",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Adaptive recommendations based on your specific error patterns and
            learning progress with personalized difficulty adjustment.
          </p>

          <div className="space-y-4">
            <div className="p-5 border-2 border-red-200 dark:border-red-800/50 rounded-xl bg-gradient-to-br from-red-50/80 to-pink-50/80 dark:from-red-950/30 dark:to-pink-950/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <h4 className="text-sm font-bold text-red-800 dark:text-red-200">
                  Critical Issues (70%+ error rate)
                </h4>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                  <span>Basic practice exercises with slow repetition</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                  <span>Fundamental technique focus and breath control</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                  <span>One-on-one coaching recommendations</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-2 border-orange-200 dark:border-orange-800/50 rounded-xl bg-gradient-to-br from-orange-50/80 to-yellow-50/80 dark:from-orange-950/30 dark:to-yellow-950/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚠</span>
                </div>
                <h4 className="text-sm font-bold text-orange-800 dark:text-orange-200">
                  Moderate Issues (40-70% error rate)
                </h4>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>
                    Targeted drilling exercises with specific patterns
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>Minimal pair practice for contrast training</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>Audio comparison tools and shadowing exercises</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-2 border-green-200 dark:border-green-800/50 rounded-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-200">
                  Minor Issues (&lt;40% error rate)
                </h4>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Advanced technique refinement and fine-tuning</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Speed and fluency practice in natural contexts</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Context-based exercises and conversation practice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "data-privacy",
      title: "Privacy & Data",
      icon: Shield,
      gradient: "from-emerald-500 to-cyan-600",
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your pronunciation data is processed securely with privacy-first
              principles and transparent data handling practices.
            </p>
          </div>

          <div className="space-y-4">
            <div className="group flex items-start gap-4 p-5 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-100 dark:border-green-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
                  Temporary Processing
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Analysis runs on secure servers but audio recordings are
                  processed in real-time and never permanently stored
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-100 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                  Aggregated Insights
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only anonymized pattern data is used to improve the algorithm
                  while protecting individual user privacy
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-4 p-5 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-100 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">
                  Full User Control
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You maintain complete control over your data with options to
                  reset analysis history anytime in settings
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 shadow-2xl">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transition-transform duration-200`}
              >
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-base transition-colors duration-200">
                How Smart Coach Works
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-10 h-10 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6 mt-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smart Coach uses advanced AI to analyze your Thai pronunciation
              patterns and provide personalized guidance tailored to your
              specific learning needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group p-5 border rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 group-hover:scale-110 transition-transform duration-200">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-semibold text-sm">
                    Pattern Recognition
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Identifies recurring pronunciation challenges specific to Thai
                  language features using advanced linguistic analysis
                </p>
              </div>
              <div className="group p-5 border rounded-xl bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 group-hover:scale-110 transition-transform duration-200">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-semibold text-sm">
                    Progress Tracking
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Monitors improvement over time with weighted analysis and
                  personalized learning velocity tracking
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-0">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id

              return (
                <div
                  key={section.id}
                  className={`border-b last:border-b-0 ${
                    isActive
                      ? "bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-900/50 dark:to-blue-950/50"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-6 text-left hover:bg-muted/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${section.gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {section.title}
                        </span>
                      </div>
                      <div
                        className={`p-2 rounded-full transition-all duration-200 ${
                          isActive
                            ? "bg-blue-100 dark:bg-blue-900/50 rotate-180"
                            : "group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
                        }`}
                      >
                        {isActive ? (
                          <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isActive && (
                    <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                      {section.content}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>

        <div className="p-6 border-t bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="leading-relaxed">
              Smart Coach continuously learns from your practice sessions to
              provide increasingly accurate and personalized guidance.
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
