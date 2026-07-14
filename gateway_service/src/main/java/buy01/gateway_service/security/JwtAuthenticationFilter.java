package buy01.gateway_service.security;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

import java.nio.charset.StandardCharsets;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import buy01.gateway_service.service.UserBlacklistService;
import buy01.gateway_service.service.UserServiceClient;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtService jwtService;
    private final UserBlacklistService userBlacklistService;
    private final UserServiceClient userServiceClient;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
            GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();
        HttpMethod method = exchange.getRequest().getMethod();
        // Public endpoints
        if (path.startsWith("/auth/login") ||
                path.startsWith("/auth/register") || (method == HttpMethod.GET && path.startsWith("/products"))) {

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
        // Boolean isBlacklisted =
        // blacklistService.isBlacklisted(addBlacklistEvent.getBlacklist(), userId);
        if (userBlacklistService.isBlacklisted(userId)) {

            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

            String body = """
                    {
                      "message": "User is blacklisted"
                    }
                    """;

            DataBuffer buffer = exchange.getResponse()
                    .bufferFactory()
                    .wrap(body.getBytes(StandardCharsets.UTF_8));

            return exchange.getResponse().writeWith(Mono.just(buffer));
        }
        return userServiceClient.exists(userId)
                .flatMap(exists -> {

                    if (!exists) {

                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

                        String body = """
                                {
                                  "message": "User does not exist"
                                }
                                """;

                        DataBuffer buffer = exchange.getResponse()
                                .bufferFactory()
                                .wrap(body.getBytes(StandardCharsets.UTF_8));

                        return exchange.getResponse().writeWith(Mono.just(buffer));
                    }

                    ServerHttpRequest request = exchange.getRequest()
                            .mutate()
                            .header("X-User-Id", userId)
                            .header("X-Username", username)
                            .header("X-Role", role)
                            .build();

                    ServerWebExchange newExchange = exchange.mutate()
                            .request(request)
                            .build();

                    return chain.filter(newExchange);
                });
    }

    @Override
    public int getOrder() {
        return -1;
    }
}