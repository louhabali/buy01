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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;
    private final MediaClient mediaClient;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
    private static final int MAX_IMAGES_COUNT = 5;

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

        if (!"SELLER".equalsIgnoreCase(userRole)) {
            throw new ForbiddenException("You do not have permission to perform this action.");
        }

        validateProductDetails(name, description, price, quantity);
        validateImages(images);

        List<String> imageUrls = new ArrayList<>();
        if (hasValidImages(images)) {
            validateImages(images);
            imageUrls = mediaClient.uploadImages(images);
        } else {
            // Default placeholder for products created without images
            imageUrls.add("https://dummyimage.com/800x800/001830/ffffff.png&text=NO+IMAGE");
            // Or your media server URL:
            // "https://localhost:8089/media/images/default-product.png"
        }

        Product product = Product.builder()
                .name(name.trim())
                .description(description.trim())
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

        validateProductDetails(name, description, price, quantity);

        product.setName(name.trim());
        product.setDescription(description.trim());
        product.setPrice(price);
        product.setQuantity(quantity);

        if (hasValidImages(images)) {
            validateImages(images);
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

    private void validateProductDetails(String name, String description, Double price, Integer quantity) {
        // Name Validation
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product name is required.");
        }
        String trimmedName = name.trim();
        if (trimmedName.length() < 3 || trimmedName.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Product name must be between 3 and 100 characters.");
        }

        // Description Validation
        if (description == null || description.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required.");
        }
        String trimmedDesc = description.trim();
        if (trimmedDesc.length() < 10 || trimmedDesc.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Description must be between 10 and 1000 characters.");
        }

        // Price Validation
        if (price == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price is required.");
        }
        if (price < 0.01) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be at least 0.01 DH.");
        }
        if (price > 9999999.99) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price cannot exceed 9,999,999.99 DH.");
        }
        // Precision Check (Max 2 Decimal Places)
        if (BigDecimal.valueOf(price).scale() > 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price cannot have more than 2 decimal places.");
        }

        // Quantity Validation
        if (quantity == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity is required.");
        }
        if (quantity < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity cannot be negative.");
        }
        if (quantity > 999999) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity cannot exceed 999,999 units.");
        }
    }

    private void validateImages(MultipartFile[] images) {
        if (!hasValidImages(images)) {
            return;
        }

        if (images.length > MAX_IMAGES_COUNT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Maximum " + MAX_IMAGES_COUNT + " images allowed per product.");
        }

        for (MultipartFile file : images) {
            if (file.isEmpty()) {
                continue;
            }

            // Check Content Type
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid file type for '" + file.getOriginalFilename()
                                + "'. Only JPG, PNG, WEBP, and GIF are allowed.");
            }

            // Check Size
            if (file.getSize() > MAX_FILE_SIZE_BYTES) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "File '" + file.getOriginalFilename() + "' exceeds the 2MB size limit.");
            }
        }
    }

    private boolean hasValidImages(MultipartFile[] images) {
        return images != null && images.length > 0 && !images[0].isEmpty();
    }
}