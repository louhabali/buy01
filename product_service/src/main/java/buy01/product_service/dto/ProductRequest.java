package buy01.product_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.web.multipart.MultipartFile;
import lombok.Data;

import java.util.List;

@Data
public class ProductRequest {

    @NotBlank(message = "name is required")
    private String name;

    @Positive(message = "price must be positive")
    private Float price;

    // @NotBlank(message = "sellerId is required")
    // private String sellerId;

    private MultipartFile[] images;
}