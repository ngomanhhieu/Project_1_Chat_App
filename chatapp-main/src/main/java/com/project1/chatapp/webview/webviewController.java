package com.project1.chatapp.webview;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class webviewController {
    @Autowired
    private webviewService webviewService;
    @GetMapping("/")
    public String loadLogin(){
        return "redirect:/login";
    }
    @GetMapping("/login")
    public String login(){
        return webviewService.loadLoginPage();
    }
    @GetMapping("/mainchat/{session_id}")
    public String forwardMainchat(@PathVariable String session_id){
        return "redirect:/mainchat.html?id="+session_id;
    }
    @GetMapping("/signup")
    public String signup(){
        return webviewService.loadSignupPage();
    }
    @GetMapping("/about")
    public String about() {
        return "forward:/pages/about.html";
    }

    @GetMapping("/blog")
    public String blog() {
        return "forward:/pages/blog.html";
    }

    @GetMapping("/jobs")
    public String jobs() {
        return "forward:/pages/jobs.html";
    }

    @GetMapping("/help")
    public String help() {
        return "forward:/pages/help.html";
    }

    @GetMapping("/api")
    public String api() {
        return "forward:/pages/api.html";
    }

    @GetMapping("/privacy")
    public String privacy() {
        return "forward:/pages/privacy.html";
    }

    @GetMapping("/terms")
    public String terms() {
        return "forward:/pages/terms.html";
    }

    @GetMapping("/location")
    public String location() {
        return "forward:/pages/location.html";
    }

    @GetMapping("/lite")
    public String lite() {
        return "forward:/pages/lite.html";
    }
    @GetMapping("/profile")
    public String profile() {
        return "forward:/pages/profile.html";
    }
}
