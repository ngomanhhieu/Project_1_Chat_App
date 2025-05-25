package com.project1.chatapp.config.webSocketConfig;

import org.springframework.web.socket.*;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class webSocketHandler implements org.springframework.web.socket.WebSocketHandler {

    private final Map<String, WebSocketSession> sessionMapping = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getHandshakeHeaders().getFirst("session-id");
        if (sessionId != null) {
            sessionMapping.put(sessionId, session);
            System.out.println("WS Connected with session: " + sessionId);
        } else {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Invalid session"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = sessionMapping.entrySet()
                .stream()
                .filter(entry -> entry.getValue().equals(session))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(null);

        if (sessionId != null) {
            sessionMapping.remove(sessionId);
            System.out.println("Disconnected session: " + sessionId);
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        if (message instanceof TextMessage) {
            String payload = ((TextMessage) message).getPayload();
            System.out.println("Received message: " + payload);

            // Ensure WebSocket session is open before broadcasting
            for (WebSocketSession s : sessionMapping.values()) {
                if (s.isOpen()) {
                    s.sendMessage(new TextMessage("Broadcast: " + payload));
                } else {
                    System.out.println("Skipping closed session.");
                }
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("Transport error occurred: " + exception.getMessage());

        // Ensure session is removed from mapping before closing
        sessionMapping.values().remove(session);

        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR.withReason("Transport error occurred"));
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false; // Assuming messages are not partial
    }
}
