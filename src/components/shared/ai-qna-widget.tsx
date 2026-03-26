"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, MessageCircleQuestion, Send, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const STORAGE_KEY = "noor-ai-qna-session";
const API_TIMEOUT_MS = 30000;
const API_MAX_ATTEMPTS = 2;
const TYPING_CHUNK_DELAY_MS = 32;

type QnaApiPayload = {
  answer?: string;
  message?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseResponsePayload(response: Response): Promise<QnaApiPayload> {
  try {
    return (await response.json()) as QnaApiPayload;
  } catch {
    return {};
  }
}

function shouldRetryStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

async function requestAnswer(question: string, history: Array<{ role: ChatRole; content: string }>, citationsMode: boolean) {
  for (let attempt = 1; attempt <= API_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch("/api/islamic-qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history, citationsMode }),
        signal: controller.signal,
      });

      const payload = await parseResponsePayload(response);
      const answer = payload.answer?.trim() || payload.message?.trim();

      if (answer) {
        return answer;
      }

      if (response.ok || !shouldRetryStatus(response.status) || attempt === API_MAX_ATTEMPTS) {
        return "";
      }
    } catch {
      if (attempt === API_MAX_ATTEMPTS) return "";
    } finally {
      clearTimeout(timeoutId);
    }

    await sleep(350 * attempt);
  }

  return "";
}

function makeId(counterRef: React.MutableRefObject<number>) {
  counterRef.current += 1;
  return `msg-${counterRef.current}`;
}


export function AiQnaWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [citationsMode, setCitationsMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);
  const idCounterRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed)) setMessages(parsed);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [mounted]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const canSend = useMemo(() => question.trim().length > 0 && !isLoading, [question, isLoading]);

  const typeAssistantAnswer = async (assistantId: string, fullAnswer: string) => {
    const chunks = fullAnswer.split(/(\s+)/).filter((chunk) => chunk.length > 0);

    let built = "";
    for (const chunk of chunks) {
      if (!isMountedRef.current) return false;

      built += chunk;
      setMessages((prev) =>
        prev.map((message) => (message.id === assistantId ? { ...message, content: built } : message)),
      );
      await sleep(TYPING_CHUNK_DELAY_MS);
    }

    return true;
  };

  const askQuestion = async () => {
    const text = question.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: makeId(idCounterRef),
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setQuestion("");
    setIsLoading(true);

    try {
      const answer = await requestAnswer(
        text,
        messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        citationsMode,
      );

      const safeAnswer = answer || "দুঃখিত, এই মুহূর্তে নির্ভরযোগ্য উত্তর তৈরি করা যাচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।";

      const assistantId = makeId(idCounterRef);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
        },
      ]);

      const typed = await typeAssistantAnswer(assistantId, safeAnswer);
      if (!typed) {
        setMessages((prev) =>
          prev.map((message) => (message.id === assistantId ? { ...message, content: safeAnswer } : message)),
        );
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(idCounterRef),
          role: "assistant",
          content: "AI সেবার সাথে সংযোগ করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
    toast.success("QnA ইতিহাস মুছে ফেলা হয়েছে");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        size="icon"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-[70] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90",
          open ? "hidden" : "inline-flex",
        )}
        aria-label="AI সাহায্য"
      >
        <MessageCircleQuestion className="h-6 w-6" />
      </Button>

      <SheetContent
        side="right"
        className="flex h-full w-full flex-col border-emerald-400/20 bg-background/95 p-0 backdrop-blur-2xl sm:max-w-lg"
      >
        <SheetHeader className="border-b border-emerald-400/20 px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-emerald-600">
            <Bot className="h-5 w-5" />
            ইসলামিক AI QnA
          </SheetTitle>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3 text-sm text-muted-foreground">
              উদাহরণ: “রোজার কাযা ও ফিদয়ার পার্থক্য কী?”, “তাওবা কীভাবে করব?”, “সূরা ফাতিহার তাফসির সংক্ষেপে বলুন”
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm leading-relaxed",
                  message.role === "user"
                  ? "ml-4 sm:ml-8 bg-emerald-600/15 text-foreground"
                  : "mr-4 sm:mr-8 border border-emerald-400/20 bg-background",
                )}
              >
                <p className="mb-1 text-[11px] uppercase tracking-wide text-emerald-600/80">
                  {message.role === "user" ? (
                    <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />আপনি</span>
                  ) : (
                    <span className="inline-flex items-center gap-1"><Bot className="h-3.5 w-3.5" />AI সহায়ক</span>
                  )}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))
          )}

          {isLoading ? (
            <div className="mr-4 sm:mr-8 rounded-xl border border-emerald-400/20 bg-background px-3 py-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                উত্তর তৈরি করা হচ্ছে...
              </span>
            </div>
          ) : null}
        </div>

        <div className="border-t border-emerald-400/20 px-4 py-3 pb-20 sm:pb-3">
          <div className="mb-3 space-y-2">
            <p className="text-xs text-muted-foreground">ওয়েবসাইট সম্পূর্ণ বন্ধ করলে এই সেশনের ইতিহাস মুছে যাবে।</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={citationsMode ? "default" : "outline"}
                size="sm"
                onClick={() => setCitationsMode((prev) => !prev)}
                className="h-7 px-2 text-xs"
              >
                সূত্র মোড {citationsMode ? "চালু" : "বন্ধ"}
              </Button>
              {messages.length > 0 ? (
                <Button variant="ghost" size="sm" onClick={clearSession} className="h-7 px-2 text-xs">
                  <Trash2 className="h-3.5 w-3.5" /> মুছুন
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex gap-2">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="ইসলামিক যেকোনো প্রশ্ন লিখুন..."
              className="flex-1 min-h-[44px] resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void askQuestion();
                }
              }}
            />
            <Button
              onClick={() => void askQuestion()}
              disabled={!canSend}
              className="h-[44px] w-[44px] flex-shrink-0 rounded-md bg-emerald-700 p-0 hover:bg-emerald-800"
              aria-label="প্রশ্ন পাঠান"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
