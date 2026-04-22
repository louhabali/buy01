package buy01.product_service.controller;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.mongodb.lang.NonNull;

import buy01.product_service.ProductServiceApplication;
import buy01.product_service.model.Product;
import buy01.product_service.service.ProductService;;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public Map<String, Object> addProduct(@Valid @RequestBody ProductRequest request) {
        return productService.createProduct(request.getName(), request.getPrice(),
                request.getSellerId(), request.getImageUrls());
    }

    @Getter
    @Setter
    static class ProductRequest {
        @NotEmpty(message = "name is required")
        private String name;
        private Float price;
        @NotEmpty(message = "Seller id is required")
        private String sellerId;
        private String[] imageUrls;
        
    }

}