package buy01.product_service.controller;

import buy01.product_service.model.Product;
import buy01.product_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = "multipart/form-data")
    public Product addProduct(
            @RequestParam String name,
            @RequestParam Float price,
            @RequestParam String sellerId,
            @RequestParam(required = false) MultipartFile[] images) {

        return productService.createProduct(
                name,
                price,
                sellerId,
                images
        );
    }
}