package buy01.user_service.service;

import buy01.user_service.model.Role;
import buy01.user_service.model.User;
import buy01.user_service.repo.UserRepository;
import buy01.user_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.mongodb.DuplicateKeyException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String register(String username, String email, String password, Role role) {
        String cleanEmail = email.toLowerCase().trim();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new RuntimeException("Email already exists");
        }
        Role checkedRole = (role == Role.SELLER) ? Role.SELLER : Role.CLIENT;
        User user = User.builder()
                .username(username)
                .email(cleanEmail)
                .password(passwordEncoder.encode(password))
                .role(checkedRole)
                .build();
        try {
            userRepository.save(user);
        } catch (DuplicateKeyException e) {
            throw new RuntimeException("Email or username already exists");
        }

        return jwtUtil.generateToken(user.getId(), user.getRole().name());
    }

    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user.getId(), user.getRole().name());
    }
}