package buy01.user_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // IMPORTANT: Secret must be at least 32 characters for HS256
    private final String SECRET = "my-secret-key-that-is-at-least-32-characters-long!!"; 
    private final long EXPIRATION = 1000 * 60 * 60 * 24; 

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String userId, String role) {
        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSigningKey()) // Automatically detects algorithm based on key size
                .compact();
    }
}