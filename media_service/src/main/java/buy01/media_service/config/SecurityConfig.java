package buy01.media_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.GET,
                                "/media/images/**").permitAll()

                        .requestMatchers(HttpMethod.POST,
                                "/media/images/**").authenticated()

                        .requestMatchers(HttpMethod.DELETE,
                                "/media/images/**").authenticated()

                        .anyRequest().permitAll())

                .httpBasic(Customizer.withDefaults());

        return http.build();

    }

}