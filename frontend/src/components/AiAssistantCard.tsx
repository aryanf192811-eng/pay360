import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, Send } from 'lucide-react';
import { getAiStatus, askAi } from '../api/ai.api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

// Tier 3 AI natural-language layer (CLAUDE.md: explicit real-cost/real-risk flag). Read-only —
// the model only ever sees the same aggregate JSON the Dashboard already shows for these exact
// filters; it cannot query the database or take any action. Degrades gracefully to an explanatory
// empty state when GEMINI_API_KEY is unset (pattern 8), never a raw error in front of anyone.
export function AiAssistantCard({ filters }: { filters: { period_start?: string; period_end?: string; department_id?: string; employee_type?: string } }) {
  const { data: status } = useQuery({ queryKey: ['ai-status'], queryFn: getAiStatus });
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const askMut = useMutation({
    mutationFn: () => askAi({ question, ...filters }),
    onSuccess: (data) => { setAnswer(data.answer); setError(null); },
    onError: (err: unknown) => {
      setAnswer(null);
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'The AI assistant could not answer that.');
    },
  });

  if (!status) return null;

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-8"><Sparkles className="h-16 w-16" /> Ask About This Data</CardTitle></CardHeader>
      <CardContent>
        {!status.configured ? (
          <div className="text-sm text-text-muted">AI assistant is not configured — an admin needs to add GEMINI_API_KEY to enable it.</div>
        ) : (
          <>
            <form
              className="flex gap-8"
              onSubmit={(e) => {
                e.preventDefault();
                if (question.trim()) askMut.mutate();
              }}
            >
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Which department has the highest payroll cost?"
                maxLength={500}
                className="flex-1"
              />
              <Button type="submit" disabled={askMut.isPending || !question.trim()}>
                {askMut.isPending ? 'Asking…' : <><Send className="h-[14px] w-[14px]" /> Ask</>}
              </Button>
            </form>
            {error && <div className="mt-12 rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{error}</div>}
            {answer && <div className="mt-12 rounded-md bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] px-16 py-12 text-sm text-text">{answer}</div>}
            <div className="mt-8 text-xs text-text-muted">Answers only from the data currently shown above (filters applied) — never invented, never modifies anything.</div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
