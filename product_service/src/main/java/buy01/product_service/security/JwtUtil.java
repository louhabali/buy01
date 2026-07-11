package buy01.product_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtUtil {

    private static final String SECRET =
            "mysecretkeymysecretkeymysecretkey123456";

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public Claims extractClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token)
                .get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
           extractClaims(token);
           return true;
        } catch (Exception e) {
           return false;
        }
    }
}