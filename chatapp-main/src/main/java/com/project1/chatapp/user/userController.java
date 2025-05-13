package com.project1.chatapp.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.project1.chatapp.sessions.sessionService;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/app")
public class userController {

    @Autowired
    private userService userService;

    @Autowired
    private sessionService sessionService;

    // ✅ Tiện ích kiểm tra session
    private void checkSession(String session_id) {
        if (!sessionService.checkSession(session_id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "❌ Invalid or expired session");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody userService.loginInfo loginInfo){
        return userService.login(loginInfo).join();
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody userService.signupInfo signupInfo){
        return userService.signUp(signupInfo).join();
    }

    @PostMapping("/{session_id}/find")
    public List<userService.userPublic> findUser(@PathVariable String session_id, @RequestBody Map<String, String> payload) {
        checkSession(session_id); // ✅ check
        String info = payload.get("info");
        return userService.findUser(session_id, info);
    }

    @GetMapping("/friend/{session_id}/listfriend")
    public List<userService.friend> getFriends(@PathVariable String session_id){
        checkSession(session_id); // ✅ check
        return userService.getListFriend(session_id);
    }

    @GetMapping("/friend/{session_id}/loadRequestReceived")
    public List<userService.friendRequestReceived> getRequestsReceived(@PathVariable String session_id){
        checkSession(session_id); // ✅ check
        return userService.loadFriendRequestReceived(session_id);
    }

    @PostMapping("/friend/{session_id}/{user_id}/sendRequest")
    public ResponseEntity<String> sendFriendRequest(@PathVariable String session_id, @PathVariable String user_id){
        checkSession(session_id); // ✅ check
        userService.sendFriendRequest(session_id, user_id);
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/friend/{session_id}/{user_id}/accept")
    public ResponseEntity<String> acceptFriendRequest(@PathVariable String session_id, @PathVariable String user_id){
        checkSession(session_id); // ✅ check
        userService.acceptFriendRequest(session_id, user_id);
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/friend/{session_id}/{user_id}/refuse")
    public ResponseEntity<String> refuseFriendRequest(@PathVariable String session_id, @PathVariable String user_id){
        checkSession(session_id); // ✅ check
        userService.refuseFriendRequest(session_id, user_id);
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/friend/{session_id}/loadRequestSent")
    public List<userService.friendRequestSent> getRequestsSent(@PathVariable String session_id){
        checkSession(session_id); // ✅ check
        return userService.loadFriendRequestSent(session_id);
    }

    // Endpoint xóa session
    @DeleteMapping("/session/{session_id}/delete")
    public ResponseEntity<?> deleteSession(@PathVariable String session_id) {
        sessionService.deleteSession(session_id);
        return ResponseEntity.ok().build();
    }
}
