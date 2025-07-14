import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    title: "AI-Generated Vocabulary",
    description:
      "Generate Thai vocabulary words with English translations based on any topic you choose",
  },
  {
    title: "Thai-English Translation",
    description:
      "Bidirectional translation with romanization support for Thai text",
  },
  {
    title: "Spaced Repetition",
    description:
      "Review your saved vocabulary with an intelligent spaced repetition system",
  },
  {
    title: "Romanization Support",
    description:
      "All Thai words include romanization using the Royal Thai General System of Transcription",
  },
]

export function FeatureList() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
