"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getJoinRequests } from "@/services/classService";

import { useRouter } from "next/navigation";
// Interface thông báo join request
export interface JoinRequestDTO {
  classId: number;
  studentName: string;
  message: string;
  // Thêm các trường khác nếu cần
}

export default function TeacherNotificationToast({
  teacherId,
}: {
  teacherId: number;
}) {
  const [notifications, setNotifications] = useState<JoinRequestDTO[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const router = useRouter();
  useEffect(() => {
    if (!teacherId) return;
    console.log("Initializing WebSocket connection for teacherId:", teacherId);

    const sockjsUrl = `http://localhost:8080/ws?teacherId=${teacherId}`;
    console.log("SockJS URL:", sockjsUrl);

    const stompClient = new Client({
      connectHeaders: {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log("Connected to WebSocket!", frame);
        setConnectionStatus("Connected");
        stompClient.subscribe(
          `/user/${teacherId}/queue/join-requests`,
          (message) => {
            const payload: JoinRequestDTO = JSON.parse(message.body);
            setNotifications((prev) => [payload, ...prev]);
            // toast.info(
            //   `Yêu cầu mới: ${payload.studentId} muốn tham gia lớp ${payload.classId}`,
            //   {
            //     position: "top-right",
            //     autoClose: 5000,
            //   }
            // );
            toast.info(
              <div
                className="cursor-pointer hover:underline"
                onClick={() => router.push(`/classes/teacher`)}
              >
                {payload.message} <br />
                Học sinh: {payload.studentName} <br />
                Lớp: {payload.classId}
              </div>,
              {
                position: "bottom-right",
                autoClose: 5000,
              }
            );
          }
        );
      },

      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
        setConnectionStatus("Error");
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("WebSocket Error");
      },

      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
        setConnectionStatus("Disconnected");
      },

      webSocketFactory: () => {
        console.log("Creating SockJS connection...");
        return new SockJS(sockjsUrl);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      console.log("Cleaning up WebSocket...");
      stompClient.deactivate();
      setClient(null);
    };
  }, [teacherId]);

  return (
    <>
      <ToastContainer position="bottom-right" />
    </>
  );
}
