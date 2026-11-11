package br.edu.insper.tarefa.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig implements WebMvcConfigurer {

    // Claim customizada (Auth0 Action) que contém os papéis do usuário
    private static final String ROLES_CLAIM = "https://social-insper.com/roles";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedMethods("*");
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        /*
                         * COMO MEXER NA PROVA
                         *
                         * Situação na prova                    | O que você escreve
                         * -------------------------------------|---------------------------------------------------------------
                         * A rota mudou de nome (/tarefas)      | Troque /avaliacoes por /tarefas nas linhas abaixo
                         * Rota com id (DELETE /tarefas/{id})   | .requestMatchers(HttpMethod.DELETE, "/tarefas/**").hasAuthority("ADMIN")
                         * ADMIN e USER                         | .hasAnyAuthority("ADMIN", "USER")
                         * Só ADMIN                             | .hasAuthority("ADMIN")
                         * Só USER                              | .hasAuthority("USER")
                         * Qualquer pessoa logada               | Não escreva nada, o anyRequest().authenticated() já cobre
                         * Rota pública, sem login              | .requestMatchers("/publico/**").permitAll()
                         *
                         * - "/x/**" cobre "/x/1", "/x/media"... mas para GET liste também "/x" (a lista).
                         * - A ordem importa: a primeira linha que casar com a requisição é a que vale,
                         *   então regras específicas vêm antes de anyRequest().
                         */
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // GET /avaliacoes, /avaliacoes?emailAvaliado=x, /avaliacoes/{id}, /avaliacoes/media?email=x
                        .requestMatchers(HttpMethod.GET, "/avaliacoes", "/avaliacoes/**").hasAnyAuthority("ADMIN", "USER")
                        .requestMatchers(HttpMethod.POST, "/avaliacoes").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/avaliacoes/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/avaliacoes/**").hasAuthority("ADMIN")
                        .anyRequest().authenticated()
                )
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    // Converte os papéis da claim customizada em authorities ("ADMIN", "USER")
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName(ROLES_CLAIM);
        authoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }
}
