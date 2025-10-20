"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageCircle,
  Send,
} from "lucide-react"

export const CommentSection = ({ assignment }) => {
    const assignmentComments = getCommentsForAssignment(assignment.id)

    return (
      <div className="mt-6 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Bình luận và thảo luận</h4>
          <Badge variant="outline">{assignmentComments.length} bình luận</Badge>
        </div>

        {/* Existing Comments */}
        <div className="space-y-4 mb-6">
          {assignmentComments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{comment.userName}</span>
                    <Badge variant={comment.userRole === "teacher" ? "default" : "secondary"} className="text-xs">
                      {comment.userRole === "teacher" ? "Giáo viên" : "Học sinh"}
                    </Badge>
                    <span className="text-xs text-gray-500">{comment.createdAt}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-white rounded-lg p-3 ml-4 border-l-2 border-blue-200">
                          <div className="flex items-start space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{reply.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-xs">{reply.userName}</span>
                                <Badge
                                  variant={reply.userRole === "teacher" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {reply.userRole === "teacher" ? "Giáo viên" : "Học sinh"}
                                </Badge>
                                {reply.isNew && <Badge className="bg-red-500 text-xs">Mới</Badge>}
                                <span className="text-xs text-gray-500">{reply.createdAt}</span>
                              </div>
                              <p className="text-xs text-gray-700">{reply.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 text-xs"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    {user?.role === "teacher" ? "Trả lời học sinh" : "Trả lời"}
                  </Button>

                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 flex space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex space-x-2">
                        <Input
                          placeholder={user?.role === "teacher" ? "Trả lời học sinh..." : "Viết phản hồi..."}
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          className="text-sm"
                        />
                        <Button size="sm" onClick={() => handleAddReply(comment.id)} disabled={!newReply.trim()}>
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {assignmentComments.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Chưa có bình luận nào</p>
            </div>
          )}
        </div>

        {/* Add New Comment */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={
                  user?.role === "teacher"
                    ? "Thêm hướng dẫn hoặc thông báo cho bài tập..."
                    : "Đặt câu hỏi hoặc thảo luận về bài tập..."
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="mb-3"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {user?.role === "teacher"
                    ? "Bạn có thể thêm hướng dẫn hoặc thông báo"
                    : "Bạn có thể hỏi bài hoặc thảo luận với giáo viên"}
                </span>
                <Button size="sm" onClick={() => handleAddComment(assignment.id)} disabled={!newComment.trim()}>
                  <Send className="h-3 w-3 mr-1" />
                  Gửi bình luận
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }