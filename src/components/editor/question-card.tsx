import { Option, Question } from "@/types/quiz.type";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import "katex/dist/katex.min.css";
import { MathEditableText } from "../keyboard-math/MathEditableText";

export default function QuestionCard({
  index,
  question,
  onUpdate,
  onDelete,
}: {
  index: number;
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleSave = () => {
    onUpdate(editedQuestion);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedQuestion(question);
    setIsEditing(false);
  };

  // Kiểm tra và set đáp án đúng nếu chưa có
  useEffect(() => {
    if (!question.correctOptions && question.options.length > 0) {
      const updated = {
        ...question,
        correctOptions: question.options[0].optionLabel, // Mặc định chọn đáp án đầu tiên
      };
      onUpdate(updated);
      setEditedQuestion(updated);
    }
  }, [question, onUpdate]);

  const updateOption = (optionIndex: number, newText: string) => {
    if (isEditing) {
      setEditedQuestion((prev) => ({
        ...prev,
        options: prev.options.map((opt, i) =>
          i === optionIndex ? { ...opt, optionText: newText } : opt
        ),
      }));
    } else {
      const updated = {
        ...question,
        options: question.options.map((opt, i) =>
          i === optionIndex ? { ...opt, optionText: newText } : opt
        ),
      };
      onUpdate(updated); // lưu thật sự
      setEditedQuestion(updated); // sync local
    }
  };

  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + editedQuestion.options.length);
    const newOption: Option = {
      optionLabel: nextLabel,
      optionText: `Đáp án ${nextLabel}`,
    };
    setEditedQuestion({
      ...editedQuestion,
      options: [...editedQuestion.options, newOption],
    });
  };

  const deleteOption = (optionIndex: number) => {
    if (editedQuestion.options.length <= 2) return; // Minimum 2 options

    const currentAnswerLabel = editedQuestion.correctOptions; // "A" | "B" | ...
    const currentAnswerIndex = editedQuestion.options.findIndex(
      (opt) => opt.optionLabel === currentAnswerLabel
    );

    // Xoá option
    const updatedOptions = editedQuestion.options.filter(
      (_, i) => i !== optionIndex
    );

    // Re-label A, B, C...
    const relabeledOptions = updatedOptions.map((opt, i) => ({
      ...opt,
      optionLabel: String.fromCharCode(65 + i),
    }));
    let newAnswerLabel: string;

    if (currentAnswerIndex === optionIndex) {
      newAnswerLabel = relabeledOptions[0]?.optionLabel || "";
    } else {
      const newIndex =
        currentAnswerIndex > optionIndex
          ? currentAnswerIndex - 1
          : currentAnswerIndex;

      newAnswerLabel =
        relabeledOptions[newIndex]?.optionLabel ||
        relabeledOptions[0]?.optionLabel ||
        "";
    }

    setEditedQuestion({
      ...editedQuestion,
      options: relabeledOptions,
      correctOptions: newAnswerLabel,
    });
  };

  const setCorrectAnswer = (optionLabel: string) => {
    const updated = { ...editedQuestion, correctOptions: optionLabel };
    setEditedQuestion(updated);
    if (!isEditing) {
      onUpdate(updated); // Cập nhật ngay lập tức nếu không trong chế độ editing
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono">
              Câu {index + 1}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Lưu
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2 bg-transparent"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Nội dung câu hỏi */}
        <div className="pb-4">
          {isEditing ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Câu hỏi</Label>
              <Textarea
                value={editedQuestion.questionText}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    questionText: e.target.value,
                  })
                }
                className="min-h-[80px] resize-none"
                placeholder="Nhập nội dung câu hỏi..."
              />
              <div className="text-xs text-muted-foreground">
                Tip: Sử dụng $công thức$ cho inline math và $công thức$ cho
                display math
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted/50 rounded-md border">
              <MathEditableText
                value={question.questionText}
                onChange={(newText) => {
                  const updatedQuestion = {
                    ...question,
                    questionText: newText,
                  };
                  onUpdate(updatedQuestion);
                }}
              />
            </div>
          )}
        </div>

        {/* Đáp án */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Đáp án</Label>
            {isEditing && (
              <Button
                size="sm"
                variant="outline"
                onClick={addOption}
                className="gap-2 bg-transparent"
              >
                <Plus className="h-3 w-3" />
                Thêm đáp án
              </Button>
            )}
          </div>

          {isEditing ? (
            <RadioGroup
              value={editedQuestion.correctOptions ?? ""}
              onValueChange={setCorrectAnswer}
              className="space-y-3"
            >
              {editedQuestion.options.map((option, optionIndex) => (
                <div
                  key={option.optionLabel}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <RadioGroupItem
                    value={option.optionLabel}
                    id={`q${index}-option${optionIndex}`}
                    className="mt-0.5"
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {option.optionLabel}
                    </Badge>
                    <Input
                      value={option.optionText}
                      onChange={(e) =>
                        updateOption(optionIndex, e.target.value)
                      }
                      className="flex-1"
                      placeholder="Nhập nội dung đáp án..."
                    />
                  </div>
                  {editedQuestion.options.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteOption(optionIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2">
              {question.options.map((option, i) => (
                <div
                  key={option.optionLabel}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    option.optionLabel === question.correctOptions
                      ? "bg-green-50 border-green-200"
                      : "bg-background"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      option.optionLabel === question.correctOptions
                        ? "border-green-500 bg-green-500"
                        : "border-muted-foreground"
                    }`}
                  >
                    {option.optionLabel === question.correctOptions && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {option.optionLabel}
                  </Badge>
                  <div className="flex-1">
                    <MathEditableText
                      value={option.optionText}
                      onChange={(newText) => updateOption(i, newText)} // dùng i
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Giải thích */}
        <div className="space-y-2 mt-4">
          <Label className="text-sm font-medium">Giải thích (tùy chọn)</Label>
          {isEditing ? (
            <Textarea
              value={editedQuestion.explanation || ""}
              onChange={(e) =>
                setEditedQuestion({
                  ...editedQuestion,
                  explanation: e.target.value,
                })
              }
              className="min-h-[60px] resize-none"
              placeholder="Thêm giải thích cho đáp án..."
            />
          ) : (
            <div className="p-3 bg-muted/30 rounded-md border">
              {question.explanation ? (
                <MathEditableText
                  value={question.explanation}
                  onChange={(newText) => {
                    const updated = { ...question, explanation: newText };
                    onUpdate(updated);
                    setEditedQuestion(updated);
                  }}
                />
              ) : (
                <span className="text-muted-foreground text-sm">
                  Chưa có giải thích
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
