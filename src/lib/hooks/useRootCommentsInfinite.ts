import { useInfiniteQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "../api";
import { ApiResp, AssignmentCommentDTO, CreateAssignmentCommentRequestDto, PageResponse } from "../type";

export function useRootCommentsInfinite(assignmentId: number, size = 10) {
  return useInfiniteQuery({
    queryKey: ["comments", "roots", assignmentId, size],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await apiCall<ApiResp<PageResponse<AssignmentCommentDTO>>>(
        `/api/assignment-comments/assignment/${assignmentId}/roots?page=${pageParam}&size=${size}`
      );
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    select: (data) => ({
      ...data,
      flat: data.pages.flatMap((p) => p.content),
    }),
    staleTime: 60_000,
  });
}
export function useRepliesInfinite(parentId: number, size = 10) {
  return useInfiniteQuery({
    queryKey: ["comments", "replies", parentId, size],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await apiCall<ApiResp<PageResponse<AssignmentCommentDTO>>>(
        `/api/assignment-comments/${parentId}/replies?page=${pageParam}&size=${size}`
      );
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    select: (data) => ({
      ...data,
      flat: data.pages.flatMap((p) => p.content),
    }),
    staleTime: 60_000,
  });
}


export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAssignmentCommentRequestDto) => {
      const res = await apiCall<ApiResp<AssignmentCommentDTO>>(`/api/assignment-comments`, {
        method: "POST",
        data: payload,
      });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      const { assignmentId, parentId } = variables;
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ["comments", "replies", parentId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["comments", "roots", assignmentId] });
      }
    },
  });
}
