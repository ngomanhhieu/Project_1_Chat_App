package com.project1.chatapp.message;

import lombok.*;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;

@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class message {

	private String name;
    private String user_id;
    private String message;
    private String chat_id;
    private Timestamp time;
    private boolean sentBySession;
    public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getUser_id() {
		return user_id;
	}
	public void setUser_id(String user_id) {
		this.user_id = user_id;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public String getChat_id() {
		return chat_id;
	}
	public void setChat_id(String chat_id) {
		this.chat_id = chat_id;
	}
	public Timestamp getTime() {
		return time;
	}
	public void setTime(Timestamp time) {
		this.time = time;
	}
	public boolean isSentBySession() {
		return sentBySession;
	}
	public void setSentBySession(boolean sentBySession) {
		this.sentBySession = sentBySession;
	}
}
