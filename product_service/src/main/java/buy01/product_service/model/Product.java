package buy01.product_service.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    // @Indexed(unique = true)
    private String name;
    // @Indexed(unique = true)
    private Float price;
    private String sellerId;
    private String[] imageUrls; 
}

