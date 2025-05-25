package com.project1.chatapp.Files;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class UploadController {

    private static final String UPLOAD_DIR = "uploads/";
    //Nhan file qua End-point
    @PostMapping("/upload-chat-file")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        Map<String, String> resp = new HashMap<>();
        if (file.isEmpty()) {
            resp.put("error", "No file uploaded");
            return resp;
        }
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename(); //tranh de len file cu
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            resp.put("url", "/uploads/" + filename); //tra ve link file cho frontend
            return resp;
        } catch (IOException e) {
            resp.put("error", "Upload failed");
            return resp;
        }
    }
}


