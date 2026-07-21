package buy01.product_service.service;

import buy01.product_service.client.MediaClient;
import buy01.product_service.model.Product;
import buy01.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;
    private final MediaClient mediaClient;

    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    public Product getProduct(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product createProduct(
            String name,
            String description,
            Double price,
            Integer quantity,
            MultipartFile[] images,
            String userId) {

        List<String> imageUrls = new ArrayList<>();

        if (images != null && images.length > 0) {
            imageUrls = mediaClient.uploadImages(images);
        }

        Product product = Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .quantity(quantity)
                // .sellerId(userId)
                .userId(userId)
                .imageUrls(imageUrls)
                .build();

        return repository.save(product);
    }

    public Product updateProduct(
            String id,
            String name,
            String description,
            Double price,
            Integer quantity,
            MultipartFile[] images,
            String userId) {

        Product product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getUserId().equals(userId)) {
            throw new SecurityException("You are not the owner");
        }

        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setQuantity(quantity);

        if (images != null && images.length > 0) {

            List<String> imageUrls = mediaClient.uploadImages(images);

            product.setImageUrls(imageUrls);
        }

        return repository.save(product);
    }

    public void deleteProduct(String id, String userId) {

        Product product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getUserId().equals(userId)) {
            throw new SecurityException("You are not the owner");
        }

        repository.delete(product);
    }

    // Kafka
    public void deleteProductsByUserId(String userId) {
        repository.deleteByUserId(userId);
    }
}