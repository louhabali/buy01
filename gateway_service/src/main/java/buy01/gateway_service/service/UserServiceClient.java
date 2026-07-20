package buy01.gateway_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserServiceClient {

    WebClient webClient = WebClient.create("http://localhost:8081");

    public Mono<Boolean> exists(String userId) {

        return webClient.get()
    .uri("/internal/users/{id}/exists", userId)
                .exchangeToMono(response -> {
                    System.out.println("Status = " + response.statusCode());
                    return Mono.just(response.statusCode().is2xxSuccessful());
                })
                .doOnError(Throwable::printStackTrace);
    }
}