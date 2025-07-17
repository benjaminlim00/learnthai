import { VocabularyWord } from "@/types/database"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2, AlertCircle } from "lucide-react"

interface DeleteConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  word: VocabularyWord | null
  onConfirmDelete: () => void
  isDeleting: boolean
}

export function DeleteConfirmationModal({
  open,
  onOpenChange,
  word,
  onConfirmDelete,
  isDeleting,
}: DeleteConfirmationModalProps) {
  if (!word) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Vocabulary Word</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <div className="font-medium text-foreground mb-2">
              {word.word}
              <span className="text-muted-foreground ml-2">
                ({word.word_romanization})
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {word.translation}
            </div>
          </div>

          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-1">
                  All progress will be lost
                </p>
                <p className="text-muted-foreground">
                  This will permanently delete your learning statistics, review
                  history, and spaced repetition progress for this word.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              className="flex-1"
              disabled={isDeleting}
            >
              {isDeleting ? <>Deleting...</> : "Delete Word"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
