package com.project1.chatapp.webview;

import org.springframework.stereotype.Service;

@Service
public class webviewService {
    public String loadLoginPage(){
        return "login/login.html";
    }
    public String forwardMainchat(){
        return "forward:/mainchat/index.html";
    }
    public String loadSignupPage(){
        return "forward:signup/signup.html";
    }
}
