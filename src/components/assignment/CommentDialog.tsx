// components/CommentDialog.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateComment,
  useRootCommentsInfinite,
} from "@/lib/hooks/useRootCommentsInfinite";
import { AssignmentCommentDTO } from "@/lib/type";

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: number;
  assignmentTitle: string;
  user: { name: string; id: number };
}
export default function CommentDialog({
  open,
  onOpenChange,
  assignmentId,
  assignmentTitle,
  user,
}: CommentDialogProps) {
  const [newComment, setNewComment] = useState("");
  const { data, isLoading, fetchNextPage, hasNextPage } =
    useRootCommentsInfinite(assignmentId);
  const createComment = useCreateComment();

  const handleCreate = () => {
    if (!newComment.trim()) return;
    createComment.mutate({
      assignmentId,
      comment: newComment,
      parentId: null,
    });
    setNewComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageCircle className="h-4 w-4 mr-1" />
          Bình luận
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-screen-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bình luận - {assignmentTitle}</DialogTitle>
          <DialogDescription>Thảo luận về bài tập</DialogDescription>
        </DialogHeader>

        {/* Form comment */}
        <div className="flex items-start space-x-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Gửi bình luận..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="mb-2"
            />
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              Gửi
            </Button>
          </div>
        </div>

        {/* Danh sách comment */}
        <div className="space-y-3">
          {isLoading ? (
            <p>Đang tải bình luận...</p>
          ) : (
            data?.flat.map((comment: AssignmentCommentDTO) => (
              <div key={comment.id} className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>
                      {comment.userName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {comment.userName}
                    </div>
                    <div className="text-sm text-gray-700">
                      {comment.comment}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {hasNextPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNextPage()}
              className="w-full"
            >
              Xem thêm bình luận
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
