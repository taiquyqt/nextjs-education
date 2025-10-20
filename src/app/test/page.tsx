"use client";

import {
  useCreateComment,
  useRepliesInfinite,
  useRootCommentsInfinite,
} from "@/lib/hooks/useRootCommentsInfinite";
import { CommentEvent } from "@/lib/type";
import { connectCommentSocket } from "@/lib/ws/comment-socket";
import { useEffect, useRef } from "react";

export default function CommentTestPage() {
  const assignmentId = 37; // thay bằng ID thật để test
  const parentId = 1; // thay bằng comment cha thật để test

  const {
    data: rootData,
    isLoading: rootLoading,
    isFetchingNextPage: rootFetchingNext,
    fetchNextPage: fetchMoreRoot,
    refetch: refetchRoots,
  } = useRootCommentsInfinite(assignmentId, 5);

  const {
    data: replyData,
    isLoading: replyLoading,
    isFetchingNextPage: replyFetchingNext,
    fetchNextPage: fetchMoreReplies,
    refetch: refetchReplies,
  } = useRepliesInfinite(parentId, 10);

  const createComment = useCreateComment();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    let unsub1: (() => void) | null = null;
    let unsub2: (() => void) | null = null;

    connectCommentSocket((event: CommentEvent) => {
      console.log("[WS] Received:", event);
      if (event.assignmentId === assignmentId) {
        if (
          event.type === "CREATED" ||
          event.type === "UPDATED" ||
          event.type === "DELETED"
        ) {
          if (event.parentId == null) {
            refetchRoots();
          } else if (event.rootId === parentId) {
            refetchReplies();
          }
        }
      }
    }).then((socket) => {
      unsub1 = socket.subscribeToAssignment(assignmentId);
      unsub2 = socket.subscribeToThread(parentId);
    });

    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, [assignmentId, parentId]);
  const handleCreate = () => {
    const sampleComments = [
      "Bình luận rất hay!",
      "Cảm ơn vì bài tập 👍",
      "Tôi chưa hiểu phần này lắm...",
      "Có thể giải thích lại được không?",
      "Great job 👏",
      "Em đã nộp bài!",
      "Thầy ơi giúp em phần 2 với!",
      "Bài này hơi khó 😅",
      "Thanks a lot!",
      "Check lại đáp án giúp em ạ!",
      "Test comment từ page 1",
    ];

    const randomComment =
      sampleComments[Math.floor(Math.random() * sampleComments.length)];

    createComment.mutate({
      assignmentId,
      comment: randomComment,
    });
  };
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Test Assignment Comments</h1>

      <div className="mb-6 space-y-2">
        <h2 className="text-lg font-medium">Root Comments</h2>
        {rootLoading ? (
          <p>Đang tải root comments...</p>
        ) : (
          rootData?.flat.map((c) => (
            <div key={c.id} className="border p-2 rounded">
              <strong>{c.userName || "Ẩn danh"} :</strong> {c.comment}
            </div>
          ))
        )}

        <button
          onClick={() => fetchMoreRoot()}
          disabled={rootFetchingNext}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Tải thêm root
        </button>
      </div>

      <div className="mb-6 space-y-2">
        <h2 className="text-lg font-medium">Replies của comment #{parentId}</h2>
        {replyLoading ? (
          <p>Đang tải replies...</p>
        ) : (
          replyData?.flat.map((c) => (
            <div key={c.id} className="border p-2 rounded">
              <strong>{c.userName || "Ẩn danh"} :</strong> {c.comment}
            </div>
          ))
        )}

        <button
          onClick={() => fetchMoreReplies()}
          disabled={replyFetchingNext}
          className="bg-green-500 text-white px-4 py-1 rounded"
        >
          Tải thêm replies
        </button>
      </div>

      <button
        onClick={handleCreate}
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
      >
        Gửi comment test
      </button>

      {createComment.isPending && (
        <p className="text-sm text-gray-500">Đang gửi...</p>
      )}
      {createComment.isSuccess && (
        <p className="text-green-600">Gửi thành công ✅</p>
      )}
      {createComment.isError && (
        <p className="text-red-500">Lỗi: {createComment.error?.message}</p>
      )}
    </div>
  );
}
