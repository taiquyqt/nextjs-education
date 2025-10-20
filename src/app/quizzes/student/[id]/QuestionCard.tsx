"use client";

// components/QuestionCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LatexText from "./LatexText";

interface Option {
  id?: number;
  optionLabel: string;
  optionText: string;
}

interface Question {
  id: number;
  questionText: string;
  questionType: "ONE_CHOICE" | "MULTI_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";
  score: number;
  options: Option[];
}

interface Props {
  index: number;
  data: Question;
  answer: string | string[];
  onAnswer: (value: string | string[]) => void;
}

export default function QuestionCard({ index, data, answer, onAnswer }: Props) {
  // Handle different question types with appropriate UI components
  const renderQuestionContent = () => {
    switch (data.questionType) {
      case "ONE_CHOICE":
        return (
          <RadioGroup
            value={typeof answer === "string" ? answer : ""}
            onValueChange={(value) => onAnswer(value)}
          >
            {data.options.map((option, i) => (
              <div key={option.id || i} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.optionLabel}
                  id={`q${data.id}_${option.id || i}`}
                />
                <Label htmlFor={`q${data.id}_${option.id || i}`}>
                  <LatexText
                    content={`${option.optionLabel}. ${option.optionText}`}
                  />
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "MULTI_CHOICE":
        const selectedAnswers = Array.isArray(answer) ? answer : [];
        return (
          <div className="space-y-3">
            {data.options.map((option, i) => (
              <div key={option.id || i} className="flex items-center space-x-2">
                <Checkbox
                  id={`q${data.id}_${option.id || i}`}
                  checked={selectedAnswers.includes(option.optionLabel)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onAnswer([...selectedAnswers, option.optionLabel]);
                    } else {
                      onAnswer(
                        selectedAnswers.filter((a) => a !== option.optionLabel)
                      );
                    }
                  }}
                />
                <Label htmlFor={`q${data.id}_${option.id || i}`}>
                  <LatexText
                    content={`${option.optionLabel}. ${option.optionText}`}
                  />
                </Label>
              </div>
            ))}
          </div>
        );

      case "TRUE_FALSE":
        return (
          <RadioGroup
            value={typeof answer === "string" ? answer : ""}
            onValueChange={(value) => onAnswer(value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="TRUE" id={`q${data.id}_true`} />
              <Label htmlFor={`q${data.id}_true`}>Đúng</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="FALSE" id={`q${data.id}_false`} />
              <Label htmlFor={`q${data.id}_false`}>Sai</Label>
            </div>
          </RadioGroup>
        );

      case "FILL_BLANK":
        const textAnswer = typeof answer === "string" ? answer : "";
        const isLongText = textAnswer.length > 50;

        return (
          <div className="space-y-2">
            <Label
              htmlFor={`q${data.id}_input`}
              className="text-sm font-medium"
            >
              Nhập câu trả lời của bạn:
            </Label>
            {isLongText ? (
              <Textarea
                id={`q${data.id}_input`}
                value={textAnswer}
                onChange={(e) => onAnswer(e.target.value)}
                placeholder="Nhập câu trả lời..."
                className="min-h-[100px] resize-y"
              />
            ) : (
              <Input
                id={`q${data.id}_input`}
                value={textAnswer}
                onChange={(e) => {
                  const newValue = e.target.value;
                  onAnswer(newValue);
                }}
                placeholder="Nhập câu trả lời..."
                className="w-full"
              />
            )}
          </div>
        );

      default:
        return <div>Loại câu hỏi không được hỗ trợ</div>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          <LatexText content={`Câu ${index + 1}: ${data.questionText} `} />
        </CardTitle>
        <div className="text-sm text-gray-500">
          {data.questionType === "ONE_CHOICE" && "Chọn một đáp án"}
          {data.questionType === "MULTI_CHOICE" && "Chọn nhiều đáp án"}
          {data.questionType === "TRUE_FALSE" && "Đúng hoặc Sai"}
          {data.questionType === "FILL_BLANK" && "Điền vào chỗ trống"}
        </div>
      </CardHeader>
      <CardContent>{renderQuestionContent()}</CardContent>
    </Card>
  );
}
