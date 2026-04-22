package buy01.product_service.repo;

import org.springframework.data.mongodb.repository.MongoRepository;

import buy01.product_service.model.Product;

public interface ProductRepository extends MongoRepository<Product, String>{
    
}
