package buy01.gateway_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserServiceClient {

    private final WebClient webClient;

    public Mono<Boolean> exists(String userId) {

        return webClient.get()
                .uri("http://user-service:8081/internal/users/{id}/exists", userId)
                .retrieve()
                .toBodilessEntity()
                .map(response -> true)
                .onErrorReturn(false);
    }
}