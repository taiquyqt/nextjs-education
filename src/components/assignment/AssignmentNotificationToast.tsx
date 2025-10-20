"use client";
import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useRouter } from "next/navigation";
import { getStudentClassesOf } from "@/services/classService";

export interface NotificationAssignmentDTO {
  classId: number;
  title: string;
  description: string;
  dueDate: string;
  message: string;
}

// SINGLETON Pattern - Chỉ cho phép 1 connection duy nhất
class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private client: Client | null = null;
  private isConnecting: boolean = false;
  private subscribers: Set<(notification: NotificationAssignmentDTO) => void> = new Set();
  
  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  async connect(studentId: number) {
    if (this.isConnecting || this.client?.connected) {
      console.log("Already connected or connecting");
      return;
    }

    this.isConnecting = true;
    console.log("Starting new connection for student:", studentId);

    // Cleanup existing connection
    this.disconnect();

    try {
      const classes = await getStudentClassesOf(studentId);
      const classIds = classes.map((c: { id: any }) => c.id);
      console.log("Classes of student:", classIds);

      const sockjsUrl = `http://localhost:8080/ws`;
      const stompClient = new Client({
        connectHeaders: {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: (frame) => {
          console.log("WebSocket Connected!", frame);
          
          // Subscribe to all classes
          classIds.forEach((cid: any) => {
            const topicPath = `/topic/class/${cid}/assignments`;
            stompClient.subscribe(topicPath, (message) => {
              try {
                const payload: NotificationAssignmentDTO = JSON.parse(message.body);
                console.log(`Broadcasting to ${this.subscribers.size} subscribers:`, payload);
                
                // Broadcast to all subscribers
                this.subscribers.forEach(callback => callback(payload));
              } catch (err) {
                console.error("Error parsing message:", err);
              }
            });
            console.log("Subscribed to:", topicPath);
          });
          
          this.isConnecting = false;
        },

        onStompError: (frame) => {
          console.error("Broker error:", frame.headers["message"]);
          this.isConnecting = false;
        },

        onWebSocketError: (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
        },

        onDisconnect: () => {
          console.log("Disconnected");
          this.isConnecting = false;
        },

        webSocketFactory: () => new SockJS(sockjsUrl),
      });

      stompClient.activate();
      this.client = stompClient;
    } catch (err) {
      console.error("Error connecting:", err);
      this.isConnecting = false;
    }
  }

  disconnect() {
    console.log("Disconnecting WebSocket...");
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.isConnecting = false;
  }

  subscribe(callback: (notification: NotificationAssignmentDTO) => void) {
    this.subscribers.add(callback);
    console.log("Subscriber added. Total:", this.subscribers.size);
    
    return () => {
      this.subscribers.delete(callback);
      console.log("Subscriber removed. Total:", this.subscribers.size);
    };
  }

  static cleanup() {
    if (WebSocketManager.instance) {
      WebSocketManager.instance.disconnect();
      WebSocketManager.instance.subscribers.clear();
      WebSocketManager.instance = null;
      console.log("WebSocket Manager cleaned up");
    }
  }
}

export default function AssignmentNotificationToast({
  studentId,
}: {
  studentId: number;
}) {
  const router = useRouter();
  const wsManager = WebSocketManager.getInstance();
  
  useEffect(() => {
    if (!studentId) return;

    console.log("Setting up notification for student:", studentId);

    // Subscribe to notifications
    const unsubscribe = wsManager.subscribe((notification: NotificationAssignmentDTO) => {
      const toastId = `assignment-${notification.classId}-${notification.title}`;
      
      // Check if toast already exists
      if (toast.isActive(toastId)) {
        console.log("Toast already active, skipping:", toastId);
        return;
      }

      console.log("Creating toast:", toastId);
      toast.info(
        <div
          className="cursor-pointer hover:underline"
          onClick={() => router.push(`/classes/${notification.classId}`)}
        >
          {notification.message} <br />
          {notification.title} <br />
          Hạn: {new Date(notification.dueDate).toLocaleString()}
        </div>,
        { 
          position: "top-right", 
          autoClose: 6000,
          toastId: toastId
        }
      );
    });

    // Connect WebSocket
    wsManager.connect(studentId);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Component cleanup");
      unsubscribe();
    };
  }, [studentId]);

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      WebSocketManager.cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return <ToastContainer position="top-right" />;
}