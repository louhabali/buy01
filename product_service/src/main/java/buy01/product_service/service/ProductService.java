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
            Float price,
            MultipartFile[] images,
            String userId) {

        // Authentication auth =
        //         SecurityContextHolder.getContext().getAuthentication();
        //         String sellerId = auth.getName();
        //         System.out.println("Authenticated user: " + sellerId);
        List<String> imageUrls = new ArrayList<>();

        if(images != null && images.length > 0){

            imageUrls = mediaClient.uploadImages(images);

        }

        Product product = Product.builder()
                .name(name)
                .price(price)
                .sellerId(userId)
                .imageUrls(imageUrls)
                .build();

        return repository.save(product);
    }

    public Product updateProduct(
            String id,
            String name,
            Float price,
            MultipartFile[] images){

        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        String sellerId = auth.getName();

        Product product = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found"));

        if(!product.getSellerId().equals(sellerId)){
            throw new SecurityException("You are not the owner");
        }

        product.setName(name);
        product.setPrice(price);

        if(images != null && images.length > 0){

            List<String> imageUrls =
                    mediaClient.uploadImages(images);

            product.setImageUrls(imageUrls);
        }

        return repository.save(product);

    }

    public void deleteProduct(String id){

        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        String sellerId = auth.getName();

        Product product = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found"));

        if(!product.getSellerId().equals(sellerId)){
            throw new SecurityException("You are not the owner");
        }

        repository.delete(product);

    }

    // kafka 
    public void deleteProductsBySellerId(String sellerId) {

    repository.deleteBySellerId(sellerId);

    System.out.println("Deleted all products of seller: " + sellerId);
}
}