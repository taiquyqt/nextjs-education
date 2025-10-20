"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { useQuizzStorage } from "@/lib/store/useQuizzStorage";
import { Question } from "@/types/quiz.type";
import QuestionCard from "./question-card";

export function QuizEditor() {
  const { data, setData } = useQuizzStorage();

  const items = data?.questions ?? [];

  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Không có câu hỏi để hiển thị.
      </p>
    );
  }

  const deleteQuestion = (index: number) => {
    const updatedQuestions = items.filter((_, i) => i !== index);
    setData({ questions: updatedQuestions });
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = items.map((q, i) =>
      i === index ? updatedQuestion : q
    );
    setData({ questions: updatedQuestions });
  };
  return (
    <div className="space-y-6">
      {items.map((q, idx) => (
        <QuestionCard
          key={idx}
          index={idx}
          question={q}
          onUpdate={(updatedQuestion) => updateQuestion(idx, updatedQuestion)}
          onDelete={() => deleteQuestion(idx)}
        />
      ))}
    </div>
  );
}
