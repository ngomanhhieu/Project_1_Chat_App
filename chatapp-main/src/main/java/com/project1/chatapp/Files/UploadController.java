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
        // Kiểm tra giới hạn dung lượng
        if (file.getSize() > 2 * 1024 * 1024) {
            resp.put("error", "File vượt quá dung lượng 2MB!");
            return resp;
        }
        try {
            String originalFilename = file.getOriginalFilename();
            String filename = UUID.randomUUID() + "_" + originalFilename;
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            resp.put("url", "/uploads/" + filename);
            resp.put("filename", originalFilename); // quan trọng
            return resp;
        } catch (IOException e) {
            resp.put("error", "Upload failed");
            return resp;
        }

    }
}


