// Utility functions for Thai voice selection

export function getThaiVoiceFromSpeakerPreference(
  speakerPreference: "male" | "female"
): string {
  return speakerPreference === "male"
    ? "th-TH-NiwatNeural"
    : "th-TH-PremwadeeNeural"
}
