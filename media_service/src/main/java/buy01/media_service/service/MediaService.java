package buy01.media_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class MediaService {

    private static final Path UPLOAD_DIR = Paths.get("/app/uploads");

    public List<String> upload(MultipartFile[] images) {

        List<String> imageUrls = new ArrayList<>();

        try {

            if (!Files.exists(UPLOAD_DIR)) {
                Files.createDirectories(UPLOAD_DIR);
            }

            for (MultipartFile image : images) {

                String fileName =
                        System.currentTimeMillis() +
                        "_" +
                        image.getOriginalFilename();

                Path filePath = UPLOAD_DIR.resolve(fileName);

                image.transferTo(filePath);

                imageUrls.add(
                        "https://localhost:8089/uploads/" + fileName
                );

                System.out.println("Saved image: " + filePath.toAbsolutePath());

            }

            return imageUrls;

        } catch (Exception e) {

            throw new RuntimeException(e);

        }

    }

}