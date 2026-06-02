package buy01.product_service.service;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.mongodb.DuplicateKeyException;

import buy01.product_service.model.Product;
// import buy01.product_service.repo.ProductRepository;
import buy01.product_service.repository.ProductRepository;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Map<String, Object> createProduct(String name, Float price, String sellerId, String[] imageUrls) {

        Product product = Product.builder()
                .name(name.trim())
                .price(price)
                .sellerId(sellerId.trim())
                .build();
                productRepository.save(product);
                
        // System.out.println("####################################");
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product created successfully");

        return response;

    }

}