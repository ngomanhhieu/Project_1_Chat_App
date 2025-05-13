package com.project1.chatapp.sessions;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.*;
import java.util.UUID;

@Service
public class sessionService {

    @Autowired
    private DataSource dataSource;

    private String generateSessionId() {
        return UUID.randomUUID().toString();
    }

    /**
     * Tạo session mới cho user và lưu vào SQL Server.
     */
    public String newSession(String user_id) {
        String session_id = generateSessionId();
        String query = "INSERT INTO master.dbo.sessions (user_id, session_id) VALUES (?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, user_id);
            stmt.setString(2, session_id);
            stmt.executeUpdate();
            return session_id;
        } catch (SQLException e) {
            throw new RuntimeException("❌ Error creating session", e);
        }
    }

    /**
     * Kiểm tra session có hợp lệ không.
     */
    public boolean checkSession(String session_id) {
        String query = "SELECT 1 FROM master.dbo.sessions WHERE session_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, session_id);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            throw new RuntimeException("❌ Error checking session", e);
        }
    }
    
    

    /**
     * Lấy session_id từ user_id.
     */
    public String getSessionIdFromUser(String user_id) {
        String query = "SELECT session_id FROM master.dbo.sessions WHERE user_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, user_id);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? rs.getString("session_id") : null;
            }
        } catch (SQLException e) {
            throw new RuntimeException("❌ Error getting session ID from user", e);
        }
    }
    public String getUserIdFromSession(String session_id) {
        String query = "SELECT user_id FROM master.dbo.sessions WHERE session_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, session_id);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? rs.getString("user_id") : null;
            }
        } catch (SQLException e) {
            throw new RuntimeException("❌ Error getting user ID from session", e);
        }
    }

    public void deleteSession(String session_id) {
        String query = "DELETE FROM master.dbo.sessions WHERE session_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, session_id);
            int affectedRows = stmt.executeUpdate(); // lưu số dòng bị ảnh hưởng

            if (affectedRows > 0) {
                System.out.println("✅ Xoá session thành công");
            } else {
                System.out.println("⚠️ Không tìm thấy session để xoá");
            }

        } catch (SQLException e) {
            throw new RuntimeException("❌ Lỗi khi xoá session", e);
        }
    }

}
