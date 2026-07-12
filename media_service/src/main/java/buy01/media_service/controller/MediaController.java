package buy01.media_service.controller;

import buy01.media_service.service.MediaService;
import lombok.RequiredArgsConstructor;
<<<<<<< HEAD
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
=======
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
>>>>>>> origin/feature/product-service

import java.util.List;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public List<String> uploadImages(
        @RequestPart("images") MultipartFile[] images) {

        return mediaService.upload(images);
    }

}