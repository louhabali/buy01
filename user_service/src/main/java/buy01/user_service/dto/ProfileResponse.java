package buy01.user_service.dto;

import buy01.user_service.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileResponse {

    private String id;
    private String name;
    private String email;
    private Role role;
    private String avatar;

}