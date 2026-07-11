package buy01.media_service.controller;

import buy01.media_service.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/media/images")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<String> uploadImages(
            @RequestPart("images") MultipartFile[] images) {

        return mediaService.upload(images);
    }

    @GetMapping("/{fileName:.+}")
    public Resource getImage(@PathVariable String fileName) {

        return mediaService.getImage(fileName);
    }

    @DeleteMapping("/{fileName:.+}")
    public void deleteImage(@PathVariable String fileName) {

        mediaService.delete(fileName);
    }

}