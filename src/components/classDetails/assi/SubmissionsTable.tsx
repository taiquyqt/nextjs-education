"use client";

import { useState } from "react";
import { Submission } from "@/types/assignment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { gradeSubmission } from "@/services/submissionService";

interface SubmissionsTableProps {
  assignmentId: number;
  submissions: Submission[];
  onScoreUpdated: (
    assignmentId: number,
    submissionId: number,
    score: number,
    teacherComment: string
  ) => void;
}

export default function SubmissionsTable({
  assignmentId,
  submissions,
  onScoreUpdated,
}: SubmissionsTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");

  const handleSave = async () => {
    if (!selectedSubmission) return;
    try {
      // TODO: gọi API chấm điểm
       //await gradeSubmission(selectedSubmission.id, { score, comment });

      // Sau khi API ok → update UI qua callback
      onScoreUpdated(assignmentId, selectedSubmission.id, Number(score), comment);

      setSelectedSubmission(null);
      setScore("");
      setComment("");
    } catch (error) {
      console.error("Chấm điểm thất bại:", error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Học sinh</th>
            <th className="border px-3 py-2 text-left">Email</th>
            <th className="border px-3 py-2 text-center">Trạng thái</th>
            <th className="border px-3 py-2 text-center">Điểm</th>
            <th className="border px-3 py-2 text-left">Nhận xét</th>
            <th className="border px-3 py-2 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length > 0 ? (
            submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{sub.student.fullName}</td>
                <td className="border px-3 py-2">{sub.student.email}</td>
                <td className="border px-3 py-2 text-center">
                  {sub.status === "GRADED" ? (
                    <Badge className="bg-green-500">Đã chấm</Badge>
                  ) : (
                    <Badge variant="secondary">Chưa chấm</Badge>
                  )}
                </td>
                <td className="border px-3 py-2 text-center">
                  {sub.score != null ? `${sub.score}/10` : "-"}
                </td>
                <td className="border px-3 py-2">
                  {sub.teacherComment || "-"}
                </td>
                <td className="border px-3 py-2 text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setScore(sub.score?.toString() || "");
                          setComment(sub.teacherComment || "");
                        }}
                      >
                        {sub.status === "GRADED" ? "Sửa điểm" : "Chấm điểm"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {sub.student.fullName} - Chấm điểm
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div>
                          <label className="text-sm font-medium">Điểm</label>
                          <Input
                            type="number"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            placeholder="VD: 8"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Nhận xét</label>
                          <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Nhập nhận xét..."
                          />
                        </div>
                        <Button onClick={handleSave}>Lưu</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                Chưa có bài nộp nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
