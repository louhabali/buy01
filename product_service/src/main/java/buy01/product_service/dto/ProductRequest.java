package buy01.product_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class ProductRequest {

    @NotBlank
    private String name;

    private String description;

    @Positive
    private double price;

    private List<String> imageUrls;
}
