import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchQuestionComments, addQuestionComment } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuestionComments = ({ questionId }: { questionId: number }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", questionId],
    queryFn: () => fetchQuestionComments(questionId),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: () => addQuestionComment(questionId, { comment_text: text }),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["comments", questionId] });
    },
  });

  return (
    <div className="mt-4 border-t pt-4">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare className="h-4 w-4" />
        {isOpen ? "Masquer les discussions" : "Discuter de cette question"}
      </Button>

      {isOpen && (
        <div className="mt-4 space-y-4 px-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Soyez le premier à discuter de cette question.
            </p>
          ) : (
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {comments.map((c) => (
                <div key={c.id} className="rounded-md bg-muted/30 p-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">
                      {c.user.full_name || c.user.username}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-foreground/80">{c.comment_text}</p>
                </div>
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Votre commentaire..."
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && text.trim()) mutation.mutate();
                }}
              />
              <Button
                size="sm"
                className="shrink-0"
                disabled={!text.trim() || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Connectez-vous pour participer à la discussion.</p>
          )}
        </div>
      )}
    </div>
  );
};
