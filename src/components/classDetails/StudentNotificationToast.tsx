"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Interface này tương ứng với ApprovalResponseDTO từ back-end
export interface ApprovalResponseDTO {
  requestId: number;
  approved: boolean;
  message: string;
}

export default function StudentNotificationToast({
  studentId,
}: {
  studentId: number;
}) {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!studentId) return;

    console.log("Initializing WebSocket connection for studentId:", studentId);

    const sockjsUrl = `http://localhost:8080/ws?studentId=${studentId}`;

    const stompClient = new Client({
      connectHeaders: {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame) => {
        console.log("Connected to WebSocket for student!", frame);

        // Đăng ký lắng nghe đúng kênh mà back-end đang gửi tới
        stompClient.subscribe(
          `/user/${studentId}/queue/join-requests-response`,
          (message) => {
            const payload: ApprovalResponseDTO = JSON.parse(message.body);
            
            // Hiển thị toast dựa trên trường 'approved' và 'message'
            if (payload.approved) {
              toast.success(`🎉 Yêu cầu của bạn đã được chấp nhận!`, {
                autoClose: 8000,
              });
            } else {
              toast.error(`😢 ${payload.message}`, {
                autoClose: 8000,
              });
            }
          }
        );
      },

      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
      },

      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
      },

      webSocketFactory: () => {
        return new SockJS(sockjsUrl);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      console.log("Cleaning up WebSocket for student...");
      stompClient.deactivate();
      setClient(null);
    };
  }, [studentId]);

  return <ToastContainer position="top-center" />;
}