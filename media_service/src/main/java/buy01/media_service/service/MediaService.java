package buy01.media_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class MediaService {

    public List<String> upload(MultipartFile[] images) {

        List<String> imageUrls = new ArrayList<>();

        try {

            Path uploadDir = Paths.get("uploads");

            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            for (MultipartFile image : images) {

                String fileName =
                        System.currentTimeMillis()
                                + "_"
                                + image.getOriginalFilename();

                Path filePath = uploadDir.resolve(fileName);

                image.transferTo(filePath);

                imageUrls.add("http://localhost:8083/uploads/" + fileName);
            }

            return imageUrls;

        } catch (Exception e) {

            throw new RuntimeException(e);
        }
    }

}