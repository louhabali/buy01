package buy01.media_service.service;

import buy01.media_service.model.Media;
import buy01.media_service.repository.MediaRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
public class MediaService {


    private final MediaRepository repository;


    private final Path uploadDir = Paths.get("uploads");


    public MediaService(MediaRepository repository) {
        this.repository = repository;
    }

    public List<String> upload(MultipartFile[] images) {


        List<String> imageUrls = new ArrayList<>();


        try {


            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }


            Authentication auth =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();



            for (MultipartFile image : images) {


                if (image.isEmpty()) {
                    throw new RuntimeException("Empty file");
                }



                if (image.getSize() > 2 * 1024 * 1024) {
                    throw new RuntimeException(
                            "Image exceeds 2 MB"
                    );
                }



                String contentType =
                        image.getContentType();



                if (contentType == null ||
                        !contentType.startsWith("image/")) {

                    throw new RuntimeException(
                            "Only images are allowed"
                    );
                }



                String original =
                        image.getOriginalFilename();



                String extension = "";



                if (original != null &&
                        original.contains(".")) {

                    extension =
                            original.substring(
                                    original.lastIndexOf(".")
                            );
                }



                String fileName =
                        UUID.randomUUID()
                                + extension;



                Path destination =
                        uploadDir.resolve(fileName);



                image.transferTo(destination);



                String url =
                        "http://localhost:8083/media/images/"
                                + fileName;



                Media media =
                        Media.builder()
                                .fileName(fileName)
                                .url(url)
                                .sellerId(auth.getName())
                                .build();



                repository.save(media);



                imageUrls.add(url);

            }



            return imageUrls;



        } catch (Exception e) {

            throw new RuntimeException(
                    "Upload failed",
                    e
            );
        }
    }

    public Resource getImage(String fileName) {


        try {


            Path file =
                    uploadDir.resolve(fileName);



            Resource resource =
                    new UrlResource(
                            file.toUri()
                    );



            if (!resource.exists()) {

                throw new RuntimeException(
                        "Image not found"
                );
            }



            return resource;



        } catch (MalformedURLException e) {


            throw new RuntimeException(
                    "Invalid file",
                    e
            );
        }
    }

    public void delete(String fileName) {


        try {
            
            Media media =
            repository.findByFileName(fileName)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Image not found"
                        )
                );

            Authentication auth =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            if (!media.getSellerId()
                    .equals(auth.getName())) {


                throw new SecurityException(
                        "Unauthorized"
                );
            }

            Path file =
                    uploadDir.resolve(
                            media.getFileName()
                    );

            Files.deleteIfExists(file);

            repository.delete(media);

        } catch (Exception e) {


            throw new RuntimeException(
                    "Delete failed",
                    e
            );
        }
    }

}
