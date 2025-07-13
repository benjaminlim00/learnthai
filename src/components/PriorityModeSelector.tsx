import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PriorityModeSelectorProps {
  selectedMode: "difficulty" | "time"
  onModeChange: (mode: "difficulty" | "time") => void
  disabled?: boolean
}

export function PriorityModeSelector({
  selectedMode,
  onModeChange,
  disabled = false,
}: PriorityModeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Mode:</span>
      <Select
        value={selectedMode}
        onValueChange={onModeChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="difficulty">🎯 Smart Priority</SelectItem>
          <SelectItem value="time">⏰ Time-based</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
