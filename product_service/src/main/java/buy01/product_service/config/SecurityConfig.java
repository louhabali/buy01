package buy01.product_service.config;

import buy01.product_service.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// @Configuration
// @RequiredArgsConstructor
// public class SecurityConfig {

//     private final JwtFilter jwtFilter;

//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

//         http
//             .csrf(csrf -> csrf.disable())
//             .authorizeHttpRequests(auth -> auth
//                     .anyRequest().permitAll()
//             );

//         return http.build();
//     }
// }

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http

                .csrf(csrf -> csrf.disable())

                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.GET,"/products/**")
                        .permitAll()

                        .requestMatchers(HttpMethod.POST,"/products/**")
                        .hasRole("SELLER")

                        .requestMatchers(HttpMethod.PUT,"/products/**")
                        .hasRole("SELLER")

                        .requestMatchers(HttpMethod.DELETE,"/products/**")
                        .hasRole("SELLER")

                        .anyRequest().permitAll())

                .addFilterBefore(jwtFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();

    }

}