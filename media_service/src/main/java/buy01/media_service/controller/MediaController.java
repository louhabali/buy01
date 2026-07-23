package buy01.media_service.controller;

import buy01.media_service.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;
    private static final Path UPLOAD_DIR = Paths.get("/app/uploads").toAbsolutePath().normalize();

    @PostMapping(
            value = "/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public List<String> uploadImages(
            @RequestPart("images") MultipartFile[] images
    ) {
        return mediaService.upload(images);
    }

    @GetMapping("/images/{id}")
    public ResponseEntity<Resource> getImage(
            @PathVariable String id
    ) throws IOException {

        Path path = UPLOAD_DIR.resolve(id).normalize();

        if (!Files.exists(path) || !path.startsWith(UPLOAD_DIR)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(path);

        // Dynamic MIME type detection
        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS))
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping("/images/{id}/download")
    public ResponseEntity<Resource> downloadImage(
            @PathVariable String id
    ) throws IOException {

        Path path = UPLOAD_DIR.resolve(id).normalize();

        if (!Files.exists(path) || !path.startsWith(UPLOAD_DIR)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(path);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + id + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @DeleteMapping("/images/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable String id) {
        boolean deleted = mediaService.deleteImage(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}