package com.project1.chatapp.user;

import com.project1.chatapp.sessions.sessionService;
import com.project1.chatapp.Security.bcryptService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service

public class userService {
    @Autowired
    private DataSource dataSource;
    @Autowired
    private sessionService sessionService;



    public static class loginInfo {
        public String getUsername() {
			return username;
		}
		public void setUsername(String username) {
			this.username = username;
		}
		public String getPassword() {
			return password;
		}
		public void setPassword(String password) {
			this.password = password;
		}
		private String username;
        private String password;
    }
    public static class friend {
        public String getUsername() {
			return username;
		}
		public void setUsername(String username) {
			this.username = username;
		}
		public String getUser_id() {
			return user_id;
		}
		public void setUser_id(String user_id) {
			this.user_id = user_id;
		}
		private String username;
        private String user_id;
    }

    public static class signupInfo {
        public String getName() {
			return name;
		}
		public void setName(String name) {
			this.name = name;
		}
		public String getUsername() {
			return username;
		}
		public void setUsername(String username) {
			this.username = username;
		}
		public String getPassword() {
			return password;
		}
		public void setPassword(String password) {
			this.password = password;
		}
		private String name;
        private String username;
        private String password;
    }

    public static class userPublic{
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
		private String name;
        private String user_id;
    }

    public static class friendRequestSent {
       public String getUser_id2() {
			return user_id2;
		}
		public void setUser_id2(String user_id2) {
			this.user_id2 = user_id2;
		}
		public int getStatus_id() {
			return status_id;
		}
		public void setStatus_id(int status_id) {
			this.status_id = status_id;
		}
	private String user_id2;
       private int status_id;
    }

    public static class friendRequestReceived {
        public String getUser_id1() {
			return user_id1;
		}
		public void setUser_id1(String user_id1) {
			this.user_id1 = user_id1;
		}
		public int getStatus_id() {
			return status_id;
		}
		public void setStatus_id(int status_id) {
			this.status_id = status_id;
		}
		private String user_id1;
        private int status_id;
    }
    public static String user_id="user_id";
    @Autowired
    private bcryptService bcryptService;
    @Async("AsyncExecutor")
    public CompletableFuture<ResponseEntity<String>> login(@RequestBody loginInfo loginInfo) {
        // Validate email format for username
        if (!isValidEmail(loginInfo.getUsername())) {
            return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\":\"Invalid email format\"}"));
        }

        String loginQuery = "SELECT user_id, password FROM master.dbo.[user] WHERE username = ?";
        System.out.println("Login attempt for username: " + loginInfo.getUsername());

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(loginQuery)) {

            System.out.println("Connected to database!");
            ps.setString(1, loginInfo.getUsername());
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                String storedHash = rs.getString("password");
                String userId = rs.getString("user_id");

                System.out.println("User found: " + userId);
                if (bcryptService.checkPassword(loginInfo.getPassword(), storedHash)) {
                    String sessionId = sessionService.newSession(userId);
                    System.out.println("Login successful, session: " + sessionId);
                    return CompletableFuture.completedFuture(ResponseEntity.ok(sessionId));
                } else {
                    System.out.println("Wrong password");
                    return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("{\"error\":\"Invalid username or password\"}"));
                }
            } else {
                System.out.println("User not found");
                return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("{\"error\":\"Invalid username or password\"}"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"Database error: " + e.getMessage() + "\"}"));
        }
    }

    // Helper method to validate email format
    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }



    private String idGenerator() {
        return UUID.randomUUID().toString();
    }

    @Async("AsyncExecutor")
    public CompletableFuture<ResponseEntity<String>> signUp(@RequestBody signupInfo signupInfo) {
        // Validate input fields
        if (signupInfo.getUsername() == null || signupInfo.getPassword() == null || signupInfo.getName() == null) {
            return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\":\"Fields cannot be empty\"}"));
        }

        // Validate email format for username
        if (!signupInfo.getUsername().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\":\"Invalid email format\"}"));
        }

        // Validate password security
        String password = signupInfo.getPassword();
        if (!isStrongPassword(password)) {
            return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\":\"Password must not start or end with 20** or 19**, must contain at least one special character and one uppercase letter\"}"));
        }

        String checkExistenceQuery = "SELECT * FROM master.dbo.[user] WHERE username = ?";
        String signupQuery = "INSERT INTO master.dbo.[user] (user_id, username, password, name) VALUES (?, ?, ?, ?)";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement checkStatement = connection.prepareStatement(checkExistenceQuery)) {
            checkStatement.setString(1, signupInfo.getUsername());
            ResultSet resultSet = checkStatement.executeQuery();

            if (!resultSet.next()) { // User does not exist
                String hashedPassword = bcryptService.hashPassword(password);
                String idCreated = idGenerator();

                try (PreparedStatement signupStatement = connection.prepareStatement(signupQuery)) {
                    signupStatement.setString(1, idCreated);
                    signupStatement.setString(2, signupInfo.getUsername());
                    signupStatement.setString(3, hashedPassword);
                    signupStatement.setString(4, signupInfo.getName());
                    signupStatement.executeUpdate();

                    String sessionId = sessionService.newSession(idCreated);
                    return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.OK).body(sessionId));
                }
            } else {
                return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("{\"error\":\"User already exists, please login\"}"));
            }
        } catch (SQLException ex) {
            return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + ex.getMessage() + "\"}"));
        }
    }

    // Helper method to check password strength
    private boolean isStrongPassword(String password) {
        if (password.length() < 8) return false; // Minimum length of 8
        if (password.matches("^(20|19)\\d{2}.*$")) return false; // Cannot start with 20** or 19**
        if (password.matches(".*(20|19)\\d{2}$")) return false; // Cannot end with 20** or 19**
        if (!password.matches(".*[!@#$%^&*()_+].*")) return false; // Must contain a special character
        if (!password.matches(".*[A-Z].*")) return false; // Must contain an uppercase letter
        return true;
    }


    public String getUserNameFromId (String user_id) {
        String getName="select name from [user] where user_id=?";
        try {
            Connection getNameConnection= dataSource.getConnection();
            PreparedStatement getNameStatement=getNameConnection.prepareStatement(getName);
            getNameStatement.setString(1,user_id);
            ResultSet getNameResult = getNameStatement.executeQuery();
            if (getNameResult.next()) {
                String name=getNameResult.getString("name");
                getNameStatement.close();
                getNameConnection.close();
                getNameResult.close();
                return name;
            }else{
                getNameStatement.close();
                getNameConnection.close();
                getNameResult.close();
                return null;
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public String getUserNameFromSession(String session_id) {
        if(sessionService.checkSession(session_id)) {
            String user_id = sessionService.getUserIdFromSession(session_id);
            return getUserNameFromId(user_id);
        }
        return null;
    }

    public userPublic findUserInChat(String info){
        userPublic userPublicInChat=new userPublic();
        String findUserQuery="select user_id,name from master.dbo.[user] where user_id=? or name=?";
        try{
            Connection findUserConnection= dataSource.getConnection();
            PreparedStatement findUserStatement=findUserConnection.prepareStatement(findUserQuery);
            findUserStatement.setString(1,info);
            findUserStatement.setString(2,info);
            ResultSet findUserResultSet=findUserStatement.executeQuery();
            if (findUserResultSet.next()){
                userPublicInChat.name=findUserResultSet.getString("name");
                userPublicInChat.user_id=findUserResultSet.getString(user_id);
            }
            findUserResultSet.close();
            findUserStatement.close();
            findUserConnection.close();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return userPublicInChat;
    }

    public List<userPublic> findUser(String session_id, String info) {
        if (sessionService.checkSession(session_id)) {
            if(!info.equals(sessionService.getUserIdFromSession(session_id)) && !info.equals(getUserNameFromSession(session_id))){
                List<userPublic> findUserResult = new ArrayList<>();
                String findUserQuery = "SELECT user_id, name FROM master.dbo.[user] WHERE user_id LIKE ? OR name LIKE ?";

                try (Connection findUserConnection = dataSource.getConnection();
                     PreparedStatement findUserStatement = findUserConnection.prepareStatement(findUserQuery)) {

                    String wildcardInfo = "%" + info + "%";
                    findUserStatement.setString(1, wildcardInfo);
                    findUserStatement.setString(2, wildcardInfo);
                    try (ResultSet findUserResultSet = findUserStatement.executeQuery()) {
                        while (findUserResultSet.next()) {
                            userPublic userPublic = new userPublic();
                            userPublic.setName(findUserResultSet.getString("name"));
                            userPublic.setUser_id(findUserResultSet.getString(user_id));
                            findUserResult.add(userPublic);
                        }
                    }
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }

            return findUserResult.isEmpty() ? null : findUserResult;
            }
        }
        return null;
    }

    //Friendship Service
    public List<friend> getListFriend(String session_id) {
        if (sessionService.checkSession(session_id)) {
            String user_id = sessionService.getUserIdFromSession(session_id);
            String getListFriendQuery = "SELECT * FROM master.dbo.friendship WHERE (user_id1 = ? OR user_id2 = ?) AND status_id = 1";
            List<String> friend_id = new ArrayList<>();
            List<friend> friends = new ArrayList<>();
            try (Connection getListFriendConnection = dataSource.getConnection();
                 PreparedStatement getListFriendQ = getListFriendConnection.prepareStatement(getListFriendQuery)) {
                getListFriendQ.setString(1, user_id);
                getListFriendQ.setString(2, user_id);
                try (ResultSet getListFriendResult = getListFriendQ.executeQuery()) {
                    while (getListFriendResult.next()) {
                        if (getListFriendResult.getString("user_id1").equals(user_id)) {
                            friend_id.add(getListFriendResult.getString("user_id2"));
                        } else if (getListFriendResult.getString("user_id2").equals(user_id)) {
                            friend_id.add(getListFriendResult.getString("user_id1"));
                        }
                    }
                }
                for (String i : friend_id) {
                    friend friend = new friend();
                    friend.username = getUserNameFromId(i);
                    friend.user_id = i;
                    friends.add(friend);
                }
                return friends;
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        } else {
            return null;
        }
    }
    public void sendFriendRequest(String session_id, String user_id_new) {
        if (sessionService.checkSession(session_id)) {
            String user_id = sessionService.getUserIdFromSession(session_id);
            String deletePreviousRequestQuery = "DELETE FROM master.dbo.friendship WHERE " +
                    "((user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)) AND status_id IN (0, 2)";
            String sendFriendRequestQuery = "INSERT INTO friendship (user_id1, user_id2, status_id) VALUES (?, ?, 0)";

            try (Connection connection = dataSource.getConnection()) {
                try (PreparedStatement deletePreviousRequestStatement = connection.prepareStatement(deletePreviousRequestQuery)) {
                    deletePreviousRequestStatement.setString(1, user_id);
                    deletePreviousRequestStatement.setString(2, user_id_new);
                    deletePreviousRequestStatement.setString(3, user_id_new);
                    deletePreviousRequestStatement.setString(4, user_id);
                    deletePreviousRequestStatement.executeUpdate();
                }

                try (PreparedStatement sendFriendRequestStatement = connection.prepareStatement(sendFriendRequestQuery)) {
                    sendFriendRequestStatement.setString(1, user_id);
                    sendFriendRequestStatement.setString(2, user_id_new);
                    sendFriendRequestStatement.executeUpdate();
                }
            } catch (SQLException e) {
                throw new RuntimeException("Error processing friend request", e);
            }
        } else {
            throw new RuntimeException("Invalid session");
        }
    }

    public List<friendRequestSent> loadFriendRequestSent(String session_id){
        if(sessionService.checkSession(session_id)){
            String user_id=sessionService.getUserIdFromSession(session_id);
            List<friendRequestSent> friendRequestSentList = new ArrayList<>();
            String loadFriendRequestSentQuery="select * from master.dbo.friendship where user_id1 = ?AND status_id IN (0, 2)";
            try{
                Connection loadFriendRequestSentConnection= dataSource.getConnection();
                PreparedStatement loadFriendRequestSentStatement=loadFriendRequestSentConnection.prepareStatement(loadFriendRequestSentQuery);
                loadFriendRequestSentStatement.setString(1,user_id);
                ResultSet loadFriendRequestSentResultSet=loadFriendRequestSentStatement.executeQuery();
                if(loadFriendRequestSentResultSet.next()){
                    friendRequestSent friendRequest=new friendRequestSent();
                    friendRequest.user_id2=loadFriendRequestSentResultSet.getString("user_id2");
                    friendRequest.status_id=loadFriendRequestSentResultSet.getInt("status_id");
                    friendRequestSentList.add(friendRequest);
                }
                loadFriendRequestSentResultSet.close();
                loadFriendRequestSentConnection.close();
                loadFriendRequestSentStatement.close();
                return  friendRequestSentList;
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }else {
            return null;
        }
    }
    public List<friendRequestReceived> loadFriendRequestReceived(String session_id) {
        if (sessionService.checkSession(session_id)) {
            String user_id = sessionService.getUserIdFromSession(session_id);
            List<friendRequestReceived> friendRequestReceivedList = new ArrayList<>();
            String loadFriendRequestReceivedQuery = "select * from master.dbo.friendship where user_id2 = ? AND status_id IN (0, 2)";

            try (Connection loadFriendRequestReceivedConnection = dataSource.getConnection();
                 PreparedStatement loadFriendRequestReceivedStatement = loadFriendRequestReceivedConnection.prepareStatement(loadFriendRequestReceivedQuery)) {

                loadFriendRequestReceivedStatement.setString(1, user_id);
                try (ResultSet loadFriendRequestReceivedResultSet = loadFriendRequestReceivedStatement.executeQuery()) {
                    while (loadFriendRequestReceivedResultSet.next()) {
                        friendRequestReceived friendRequest = new friendRequestReceived();
                        friendRequest.user_id1 = loadFriendRequestReceivedResultSet.getString("user_id1");
                        friendRequest.status_id = loadFriendRequestReceivedResultSet.getInt("status_id");
                        friendRequestReceivedList.add(friendRequest);
                    }
                }
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }

            return friendRequestReceivedList;
        } else {
            return new ArrayList<>();
        }
    }
    public void acceptFriendRequest(String session_id, String user_id_new) {
        if (sessionService.checkSession(session_id)) {
            String user_id = sessionService.getUserIdFromSession(session_id);
            String acceptFriendRequestQuery = "UPDATE friendship SET status_id = 1 " +
                    "WHERE (user_id1 = ? AND user_id2 = ?) OR " +
                    "(user_id1 = ? AND user_id2 = ?)";

            try (Connection connection = dataSource.getConnection();
                 PreparedStatement statement = connection.prepareStatement(acceptFriendRequestQuery)) {

                statement.setString(1, user_id);
                statement.setString(2, user_id_new);
                statement.setString(3, user_id_new);
                statement.setString(4, user_id);

                statement.executeUpdate();

                } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }
    }
    public void refuseFriendRequest(String session_id, String user_id_new) {
        if (sessionService.checkSession(session_id)) {
            String user_id = sessionService.getUserIdFromSession(session_id);
            String acceptFriendRequestQuery = "UPDATE friendship SET status_id = 2 " +
                    "WHERE (user_id1 = ? AND user_id2 = ?) OR " +
                    "(user_id1 = ? AND user_id2 = ?)";

            try (Connection connection = dataSource.getConnection();
                 PreparedStatement statement = connection.prepareStatement(acceptFriendRequestQuery)) {

                statement.setString(1, user_id);
                statement.setString(2, user_id_new);
                statement.setString(3, user_id_new);
                statement.setString(4, user_id);

                statement.executeUpdate();

            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }
    }
}

