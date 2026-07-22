package buy01.media_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class MediaService {

   
    private static final Path UPLOAD_DIR = Paths.get("uploads").toAbsolutePath().normalize();

    private static final long MAX_SIZE = 2 * 1024 * 1024; // 2 MB

    public List<String> upload(MultipartFile[] images) {

        List<String> imageUrls = new ArrayList<>();

        try {
            if (!Files.exists(UPLOAD_DIR)) {
                Files.createDirectories(UPLOAD_DIR);
            }

            for (MultipartFile image : images) {
                validateImage(image);

                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path filePath = UPLOAD_DIR.resolve(fileName);

                // Transfer file bytes safely
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                imageUrls.add("https://localhost:8089/uploads/" + fileName);

                System.out.println("Saved image: " + filePath.toAbsolutePath());
            }

            return imageUrls;

        } catch (Exception e) {
            throw new RuntimeException("Failed to store upload: " + e.getMessage(), e);
        }
    }

    private void validateImage(MultipartFile image) {
        if (image.isEmpty()) {
            throw new RuntimeException("Image cannot be empty");
        }

        if (image.getContentType() == null || !image.getContentType().startsWith("image/")) {
            throw new RuntimeException("Only images are allowed");
        }

        if (image.getSize() > MAX_SIZE) {
            throw new RuntimeException("Image size must be less than 2MB");
        }
    }
    public boolean deleteImage(String fileName) {
    try {
        Path filePath = UPLOAD_DIR.resolve(fileName).normalize();
        
        // Prevent Directory Traversal attack
        if (!filePath.startsWith(UPLOAD_DIR)) {
            throw new SecurityException("Cannot delete files outside upload directory");
        }

        return Files.deleteIfExists(filePath);
    } catch (Exception e) {
        throw new RuntimeException("Failed to delete image: " + e.getMessage(), e);
    }
}
}