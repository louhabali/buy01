package buy01.product_service.controller;

import buy01.product_service.model.Product;
import buy01.product_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product addProduct(
            // @RequestHeader("Authorization") String authHeader,
            @RequestParam String name,
            @RequestParam Float price,
            // @RequestParam String sellerId,
            @RequestParam(required = false) MultipartFile[] images) {

        return productService.createProduct(
                // authHeader,
                name,
                price,
                // sellerId,
                images
        );
    }
}