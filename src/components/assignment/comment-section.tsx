"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  ChevronDown,
  ThumbsUp,
  X,
  Hash,
} from "lucide-react";
import {
  useCreateComment,
  useRepliesInfinite,
  useRootCommentsInfinite,
} from "@/lib/hooks/useRootCommentsInfinite";
import { formatDateTime } from "@/untils/dateFormatter";
import { connectCommentSocket } from "@/lib/ws/comment-socket";

type Role = "teacher" | "student";

interface CommentSectionProps {
  assignmentId: number;
  assignmentTitle: string;
  isVisible: boolean;
  onClose: () => void;
  userRole: Role;
}

interface CommentItemData {
  id: number;
  comment: string;
  createdAt: string;
  userName?: string;
  user?: { role?: string };
  replyCount?: number;
  likeCount?: number;
  edited?: boolean;
}

/* ============ small helpers ============ */
function NameRow({
  name,
  isTeacher,
  createdAt,
  edited,
}: {
  name?: string;
  isTeacher?: boolean;
  createdAt?: string | number | Date;
  edited?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="font-medium text-slate-900 dark:text-slate-100">
        {name || "Người dùng"}
      </span>
      {isTeacher && (
        <Badge
          variant="secondary"
          className="h-4 text-[10px] px-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0"
        >
          Tác giả
        </Badge>
      )}
      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
        {formatDateTime(createdAt)}
      </span>
      {edited && (
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
          • Đã chỉnh sửa
        </span>
      )}
    </div>
  );
}

function ActionLink({
  onClick,
  children,
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:underline disabled:opacity-50 transition-colors"
    >
      {children}
    </button>
  );
}

function AutoGrowInput({
  value,
  onChange,
  placeholder,
  onEnterSubmit,
  minRows = 1,
  maxRows = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onEnterSubmit?: () => void;
  minRows?: number;
  maxRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.rows = minRows;
    const saved = el.scrollTop;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, maxRows * 24) + "px";
    el.scrollTop = saved;
  }, [value, minRows, maxRows]);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onEnterSubmit?.();
        }
      }}
      placeholder={placeholder}
      className="w-full resize-none bg-transparent outline-none text-sm leading-6 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
      style={{ lineHeight: "24px" }}
    />
  );
}

function ReplyItem({ reply }: { reply: CommentItemData }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(reply?.likeCount ?? 0);

  return (
    <div className="flex items-start gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 -mx-3 px-3 rounded-lg transition-colors">
      <Avatar className="h-8 w-8 shrink-0 ring-2 ring-white dark:ring-slate-800">
        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
          {reply?.userName?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <NameRow
            name={reply?.userName}
            isTeacher={reply?.user?.role === "TEACHER"}
            createdAt={reply?.createdAt}
            edited={reply?.edited}
          />
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {reply?.comment}
          </p>
        </div>

        <div className="pl-2 mt-2 flex items-center gap-4">
          <ActionLink
            onClick={() => {
              setLiked((s) => !s);
              setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp
                className={`h-3.5 w-3.5 ${
                  liked ? "text-blue-600 fill-blue-600" : ""
                }`}
              />
              <span className={liked ? "text-blue-600 font-medium" : ""}>
                Thích
              </span>
              {likeCount > 0 && (
                <span className="text-slate-400">• {likeCount}</span>
              )}
            </span>
          </ActionLink>
        </div>
      </div>
    </div>
  );
}

function RootItem({
  comment,
  onOpenThread,
  isSelected,
}: {
  comment: CommentItemData;
  onOpenThread: (c: CommentItemData) => void;
  isSelected?: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(comment?.likeCount ?? 0);

  return (
    <div
      className={`flex items-start gap-3 group hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-4 px-4 rounded-lg transition-all cursor-pointer ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
          : ""
      }`}
      onClick={() => onOpenThread(comment)}
    >
      <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white dark:ring-slate-800">
        <AvatarFallback className="text-sm bg-gradient-to-br from-emerald-500 to-blue-600 text-white font-medium">
          {comment?.userName?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <NameRow
            name={comment?.userName}
            isTeacher={comment?.user?.role === "TEACHER"}
            createdAt={comment?.createdAt}
            edited={comment?.edited}
          />
          <p className="text-sm mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
            {comment?.comment}
          </p>
        </div>

        <div className="pl-2 mt-2 flex items-center gap-4">
          <ActionLink
            onClick={(e) => {
              e.stopPropagation();
              setLiked((s) => !s);
              setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp
                className={`h-3.5 w-3.5 ${
                  liked ? "text-blue-600 fill-blue-600" : ""
                }`}
              />
              <span className={liked ? "text-blue-600 font-medium" : ""}>
                Thích
              </span>
              {likeCount > 0 && (
                <span className="text-slate-400">• {likeCount}</span>
              )}
            </span>
          </ActionLink>

          <ActionLink
            onClick={(e) => {
              e.stopPropagation();
              onOpenThread(comment);
            }}
          >
            Trả lời
          </ActionLink>

          {comment?.replyCount ? (
            <ActionLink
              onClick={(e) => {
                e.stopPropagation();
                onOpenThread(comment);
              }}
            >
              <span className="inline-flex items-center gap-1">
                {comment.replyCount} phản hồi{" "}
                <ChevronDown className="h-3 w-3" />
              </span>
            </ActionLink>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ThreadPanel({
  root,
  assignmentId,
  onClose,
}: {
  root: CommentItemData;
  assignmentId: number;
  onClose: () => void;
}) {
  const repliesQuery = useRepliesInfinite(root.id);
  const createComment = useCreateComment();

  const [replyText, setReplyText] = useState("");
  const replies = repliesQuery.data?.flat || [];
  const socketRef = useRef<any>(null);

  useEffect(() => {
    let unsubscribe: null | (() => void) = null;
    (async () => {
      try {
        const socket = await connectCommentSocket((event) => {
          if (event.type === "CREATED" || event.type === "UPDATED") {
            // Kiểm tra xem event có liên quan đến thread hiện tại không
            if (event.parentId === root.id || event.parentId === root.id) {
              repliesQuery.refetch();
            }
          }
        });
        socketRef.current = socket;
        unsubscribe = socket.subscribeToAssignment(assignmentId);
      } catch (e) {
        console.error("Failed to connect to comment socket:", e);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [assignmentId, root.id, repliesQuery]);

  const sendReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    await createComment.mutateAsync({
      assignmentId,
      parentId: root.id,
      comment: trimmed,
    });
    setReplyText("");
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <Hash className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Thread
          </span>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            {replies.length + 1} tin nhắn
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close thread"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white dark:ring-slate-800">
            <AvatarFallback className="text-sm bg-gradient-to-br from-emerald-500 to-blue-600 text-white font-medium">
              {root?.userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-4 py-3 border border-blue-200 dark:border-blue-800">
              <NameRow
                name={root?.userName}
                isTeacher={root?.user?.role === "TEACHER"}
                createdAt={root?.createdAt}
                edited={root?.edited}
              />
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {root?.comment}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-slate-50/30 dark:bg-slate-900/50">
        {replies.map((r: any) => (
          <ReplyItem key={r.id} reply={r} />
        ))}

        {repliesQuery.hasNextPage && (
          <div className="flex justify-center ">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-600 hover:text-slate-900 hover:bg-white dark:hover:bg-slate-800"
              onClick={() => repliesQuery.fetchNextPage()}
              disabled={repliesQuery.isFetchingNextPage}
            >
              {repliesQuery.isFetchingNextPage
                ? "Đang tải..."
                : "Xem thêm phản hồi"}
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
        <div className="flex items-end gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-pink-600 text-white font-medium">
              Bạn
            </AvatarFallback>
          </Avatar>
          <AutoGrowInput
            value={replyText}
            onChange={setReplyText}
            placeholder="Trả lời trong thread..."
            onEnterSubmit={sendReply}
            minRows={1}
            maxRows={8}
          />
          <Button
            onClick={sendReply}
            disabled={!replyText.trim() || createComment.isPending}
            size="icon"
            className="h-8 w-8 shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Gửi phản hồi"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============ Loading skeleton gọn ============ */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-16 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============ Main (2-pane layout) ============ */
export function CommentSection({
  assignmentId,
  assignmentTitle,
  isVisible,
  onClose,
  userRole,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [selectedThread, setSelectedThread] = useState<CommentItemData | null>(
    null
  );
  const socketRef = useRef<any>(null);

  const commentsQuery = useRootCommentsInfinite(assignmentId);
  const createComment = useCreateComment();

  const comments = commentsQuery.data?.flat || [];

  useEffect(() => {
    if (!isVisible) return;
    let unsubscribe: null | (() => void) = null;
    (async () => {
      try {
        const socket = await connectCommentSocket((event) => {
          if (event.type === "CREATED" || event.type === "UPDATED") {
            commentsQuery.refetch();
          }
        });
        socketRef.current = socket;
        unsubscribe = socket.subscribeToAssignment(assignmentId);
      } catch (e) {
        console.error("Failed to connect to comment socket:", e);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isVisible, assignmentId, commentsQuery]);

  const sendNew = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    await createComment.mutateAsync({ assignmentId, comment: trimmed });
    setNewComment("");
  };

  if (!isVisible) return null;

  // responsive: md trở lên hiển thị 2 cột; mobile: thread panel đè lên
  const showThreadOverlayOnMobile = !!selectedThread;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {userRole === "teacher" ? "Bình luận" : "Hỏi đáp"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {assignmentTitle}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative grid md:grid-cols-[1fr_400px] min-h-[500px]">
        <div className="px-6 py-4 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white dark:ring-slate-800">
                <AvatarFallback className="text-sm bg-gradient-to-br from-purple-500 to-pink-600 text-white font-medium">
                  Bạn
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-end gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
                  <AutoGrowInput
                    value={newComment}
                    onChange={setNewComment}
                    placeholder={
                      userRole === "teacher"
                        ? "Viết bình luận cho bài tập này..."
                        : "Đặt câu hỏi về bài tập..."
                    }
                    onEnterSubmit={sendNew}
                    minRows={1}
                    maxRows={8}
                  />
                  <Button
                    onClick={sendNew}
                    disabled={!newComment.trim() || createComment.isPending}
                    size="icon"
                    className="h-8 w-8 shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                    aria-label="Gửi bình luận"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {commentsQuery.isLoading ? (
            <LoadingSkeleton />
          ) : comments.length === 0 ? (
            <div className="py-16 text-center">
              <MessageCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Chưa có bình luận nào
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Hãy là người đầu tiên bắt đầu cuộc trò chuyện!
              </p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto pr-1 -mr-1">
              <div className="space-y-4">
                {comments.map((c: CommentItemData) => (
                  <RootItem
                    key={c.id}
                    comment={c}
                    onOpenThread={setSelectedThread}
                    isSelected={selectedThread?.id === c.id}
                  />
                ))}

                {commentsQuery.hasNextPage && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => commentsQuery.fetchNextPage()}
                      disabled={commentsQuery.isFetchingNextPage}
                      className="text-sm hover:bg-white dark:hover:bg-slate-800"
                    >
                      {commentsQuery.isFetchingNextPage
                        ? "Đang tải..."
                        : "Xem thêm bình luận"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block border-l border-slate-200 dark:border-slate-700">
          {selectedThread ? (
            <ThreadPanel
              root={selectedThread}
              assignmentId={assignmentId}
              onClose={() => setSelectedThread(null)}
            />
          ) : (
            <div className="h-full grid place-items-center text-center p-8 bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <Hash className="h-16 w-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Chọn một bình luận
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  để xem thread và trả lời
                </p>
              </div>
            </div>
          )}
        </div>

        {showThreadOverlayOnMobile && (
          <div className="md:hidden absolute inset-0 z-20 bg-white dark:bg-slate-900 animate-in slide-in-from-right">
            <ThreadPanel
              root={selectedThread as CommentItemData}
              assignmentId={assignmentId}
              onClose={() => setSelectedThread(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
