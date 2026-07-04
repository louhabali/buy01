package buy01.product_service.service;

import buy01.product_service.client.MediaClient;
import buy01.product_service.model.Product;
import buy01.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final MediaClient mediaClient;

    public Product createProduct(
            String name,
            Float price,
            MultipartFile[] images) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String sellerId = auth.getName();
        // String sellerId = "test-seller";

        List<String> imageUrls = new ArrayList<>();

        try {

            if (images != null && images.length > 0) {
                imageUrls = mediaClient.uploadImages(images);
            }

            Product product = Product.builder()
                    .name(name.trim())
                    .price(price)
                    .sellerId(sellerId)
                    .imageUrls(imageUrls)
                    .build();

            return productRepository.save(product);

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload images", e);
        }
    }
}