package buy01.user_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import buy01.user_service.repo.UserRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserRepository userRepository;

    @GetMapping("/{id}/exists")
    public ResponseEntity<Void> exists(@PathVariable String id) {
        System.out.println("WSSLAT");

        if (userRepository.existsById(id)) {
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.notFound().build();
    }
}