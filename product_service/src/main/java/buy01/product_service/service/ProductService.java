package buy01.product_service.service;

import buy01.product_service.model.Product;
import buy01.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product createProduct(
            String name,
            Float price,
            String sellerId,
            MultipartFile[] images) {

        String[] imagePaths = null;

        try {

            if (images != null && images.length > 0) {

                Path uploadDir = Paths.get("uploads");

                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }

                imagePaths = new String[images.length];

                for (int i = 0; i < images.length; i++) {

                    MultipartFile image = images[i];

                    String fileName =
                            System.currentTimeMillis()
                                    + "_"
                                    + image.getOriginalFilename();

                    Path filePath = uploadDir.resolve(fileName);

                    image.transferTo(filePath);

                    imagePaths[i] = "/uploads/" + fileName;
                }
            }

            Product product = Product.builder()
                    .name(name.trim())
                    .price(price)
                    .sellerId(sellerId.trim())
                    .imageUrls(imagePaths)
                    .build();

            return productRepository.save(product);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload images", e);
        }
    }

    // public Map<String, Object> createProduct(String name, Float price, String sellerId, String[] imageUrls) {

    //     Product product = Product.builder()
    //             .name(name.trim())
    //             .price(price)
    //             .sellerId(sellerId.trim())
    //             .build();
    //             productRepository.save(product);
                
    //     // System.out.println("####################################");
    //     Map<String, Object> response = new HashMap<>();
    //     response.put("success", true);
    //     response.put("message", "Product created successfully");

    //     return response;

    // }

}