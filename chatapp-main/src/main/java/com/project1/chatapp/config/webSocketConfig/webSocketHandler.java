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
        // Handle incoming messages from the client
        if (message instanceof TextMessage) {
            String payload = ((TextMessage) message).getPayload();
            System.out.println("Received message: " + payload);

            // Optionally, broadcast the message to all connected sessions
            for (WebSocketSession s : sessionMapping.values()) {
                s.sendMessage(new TextMessage("Broadcast: " + payload));
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        // Log the error
        System.err.println("Transport error occurred: " + exception.getMessage());

        // Optionally, close the session if an error occurs
        session.close(CloseStatus.SERVER_ERROR.withReason("Transport error occurred"));
    }

    @Override
    public boolean supportsPartialMessages() {
        // Return false, assuming the messages are not partial
        return false;
    }
}
