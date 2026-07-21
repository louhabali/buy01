package buy01.media_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class MediaService {

    private static final Path UPLOAD_DIR = Paths.get("/app/uploads");

    private static final long MAX_SIZE =
            2 * 1024 * 1024; // 2 MB


    public List<String> upload(MultipartFile[] images) {

        List<String> imageUrls = new ArrayList<>();

        try {

            if (!Files.exists(UPLOAD_DIR)) {
                Files.createDirectories(UPLOAD_DIR);
            }

            for (MultipartFile image : images) {

                // Validation avant sauvegarde
                validateImage(image);


                String fileName =
                        System.currentTimeMillis()
                        + "_"
                        + image.getOriginalFilename();


                Path filePath = UPLOAD_DIR.resolve(fileName);


                image.transferTo(filePath);


                imageUrls.add(
                        "https://localhost:8089/uploads/" + fileName
                );


                System.out.println(
                        "Saved image: " + filePath.toAbsolutePath()
                );
            }


            return imageUrls;


        } catch (Exception e) {

            throw new RuntimeException(e);

        }
    }


    private void validateImage(MultipartFile image) {

        if (image.isEmpty()) {
            throw new RuntimeException(
                    "Image cannot be empty"
            );
        }


        if (image.getContentType() == null ||
                !image.getContentType().startsWith("image/")) {

            throw new RuntimeException(
                    "Only images are allowed"
            );
        }


        if (image.getSize() > MAX_SIZE) {

            throw new RuntimeException(
                    "Image size must be less than 2MB"
            );
        }
    }
}