package buy01.product_service.service;

import buy01.product_service.model.Product;
import buy01.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product createProduct(
            String name,
            Float price,
            MultipartFile[] images) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String sellerId = auth.getName();

        List<String> imageUrls = new ArrayList<>();

        try {

            if (images != null && images.length > 0) {

                Path uploadDir = Paths.get("uploads");

                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }

                for (MultipartFile image : images) {

                    String fileName =
                            System.currentTimeMillis()
                                    + "_" + image.getOriginalFilename();

                    Path filePath = uploadDir.resolve(fileName);

                    image.transferTo(filePath);

                    imageUrls.add("/uploads/" + fileName);
                }
            }

            Product product = Product.builder()
                    .name(name.trim())
                    .price(price)
                    .sellerId(sellerId)
                    .imageUrls(imageUrls)
                    .build();

            return productRepository.save(product);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload images", e);
        }
    }
}