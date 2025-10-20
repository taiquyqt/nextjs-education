import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { CommentEvent } from "../type";

const WS_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080/ws";

let stompClient: Client | null = null;

export function connectCommentSocket(
    onMessage: (msg: CommentEvent) => void
): Promise<{
    subscribeToAssignment: (assignmentId: number) => () => void;
    subscribeToThread: (rootId: number) => () => void;
}> {
    return new Promise((resolve) => {
        stompClient = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 5000,
            debug: (str) => console.log("[WebSocket]", str),
        });

        stompClient.onConnect = () => {
            console.log("✅ WebSocket connected");

            const subscribeToAssignment = (assignmentId: number) => {
                const sub = stompClient!.subscribe(
                    `/topic/assignments/${assignmentId}/comments`,
                    (msg: IMessage) => {
                        const data: CommentEvent = JSON.parse(msg.body);
                        onMessage(data);
                    }
                );
                return () => sub.unsubscribe();
            };

            const subscribeToThread = (rootId: number) => {
                const sub = stompClient!.subscribe(
                    `/topic/comments/${rootId}`,
                    (msg: IMessage) => {
                        const data: CommentEvent = JSON.parse(msg.body);
                        onMessage(data);
                    }
                );
                return () => sub.unsubscribe();
            };

            resolve({
                subscribeToAssignment,
                subscribeToThread,
            });
        };

        stompClient.activate();
    });
}
