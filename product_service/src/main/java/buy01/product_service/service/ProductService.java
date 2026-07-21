package buy01.product_service.service;

import buy01.product_service.client.MediaClient;
import buy01.product_service.exceptions.ForbiddenException;
import buy01.product_service.model.Product;
import buy01.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;


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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    public Product createProduct(
            String name,
            String description,
            Double price,
            Integer quantity,
            MultipartFile[] images,
            String userId,
            String userRole) {

        validateUserData(userId);
        System.out.println("USERROLE :"+userRole);

        if (!"SELLER".equalsIgnoreCase(userRole)) {
               throw new ForbiddenException("You do not have permission to perform this action.");
        }
        validateProductDetails(name, price, quantity);

        List<String> imageUrls = new ArrayList<>();
        if (hasValidImages(images)) {
            imageUrls = mediaClient.uploadImages(images);
        }

        Product product = Product.builder()
                .name(name.trim())
                .description(description != null ? description.trim() : "")
                .price(price)
                .quantity(quantity)
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
            String userId,
            String userRole) {

        Product product = getProduct(id);
        verifyOwnership(product, userId, userRole);

        validateProductDetails(name, price, quantity);

        product.setName(name.trim());
        product.setDescription(description != null ? description.trim() : "");
        product.setPrice(price);
        product.setQuantity(quantity);

        if (hasValidImages(images)) {
            List<String> imageUrls = mediaClient.uploadImages(images);
            product.setImageUrls(imageUrls);
        }

        return repository.save(product);
    }

    public void deleteProduct(String id, String userId, String userRole) {
        Product product = getProduct(id);
        verifyOwnership(product, userId, userRole);
        repository.delete(product);
    }

    public void deleteProductsByUserId(String userId) {
        if (userId != null && !userId.isBlank()) {
            repository.deleteByUserId(userId);
        }
    }

    private void verifyOwnership(Product product, String userId, String userRole) {
        validateUserData(userId);

        boolean isSeller = "SELLER".equalsIgnoreCase(userRole);
        boolean isOwner = product.getUserId() != null && product.getUserId().equals(userId);

        if (!isSeller || !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Unauthorized action");
        }
    }

    private void validateUserData(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context missing or unauthenticated");
        }
    }

    private void validateProductDetails(String name, Double price, Integer quantity) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product name is required");
        }
        if (price == null || price < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product price");
        }
        if (quantity == null || quantity < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product quantity");
        }
    }

    private boolean hasValidImages(MultipartFile[] images) {
        return images != null && images.length > 0 && !images[0].isEmpty();
    }
}