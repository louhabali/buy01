package buy01.gateway_service.security;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;


import buy01.gateway_service.service.UserBlacklistService;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtService jwtService;
    private final UserBlacklistService userBlacklistService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
            GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

        // Public endpoints
        if (path.startsWith("/auth/login") ||
                path.startsWith("/auth/register")) {

            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);
        System.out.println("JWT Token: " + token);
        if (!jwtService.validateToken(token)) {

            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        Claims claims = jwtService.extractClaims(token);

        String username = claims.getSubject();
        String role = claims.get("role", String.class);
        String userId = claims.get("userId", String.class);
       // Boolean isBlacklisted = blacklistService.isBlacklisted(addBlacklistEvent.getBlacklist(), userId);
        if (userBlacklistService.isBlacklisted(userId)) {
    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
    return exchange.getResponse().setComplete();
}
        System.out.println("Adding headers:");
        System.out.println("X-User-Id = " + userId);
        System.out.println("X-Username = " + username);
        System.out.println("X-Role = " + role);
        ServerHttpRequest request = exchange.getRequest()
                .mutate()
                .header("X-User-Id", userId)
                .header("X-Username", username)
                .header("X-Role", role)
                .build();

        ServerWebExchange newExchange = exchange.mutate()
                .request(request)
                .build();

            System.out.println("Forwarding to downstream...");
        return chain.filter(newExchange).doOnSuccess(v -> System.out.println("Request completed successfully"))
        .doOnError(e -> System.out.println("Error: " + e.getMessage()));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}