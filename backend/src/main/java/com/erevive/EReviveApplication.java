package com.erevive;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class EReviveApplication {

    public static void main(String[] args) throws IOException {
        SpringApplication app = new SpringApplication(EReviveApplication.class);
        Map<String, Object> postgres = postgresSettings(System.getenv("DATABASE_URL"));
        if (postgres.isEmpty()) {
            // Local development: H2 stores its file in ./data
            Files.createDirectories(Path.of("data"));
        } else {
            // Production: PostgreSQL from DATABASE_URL
            System.setProperty("spring.datasource.url", (String) postgres.get("spring.datasource.url"));
            System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");
            System.setProperty("spring.datasource.username", (String) postgres.get("spring.datasource.username"));
            System.setProperty("spring.datasource.password", (String) postgres.get("spring.datasource.password"));
            System.setProperty("spring.sql.init.schema-locations", "classpath:schema-postgres.sql");
        }
        app.run(args);
    }

    /**
     * Converts a hosting-style database URL (postgres://user:pass@host:port/db?sslmode=require),
     * as provided by Render, Neon, Supabase and others, into Spring datasource settings.
     * Returns an empty map when the URL is missing or is not a PostgreSQL URL.
     */
    static Map<String, Object> postgresSettings(String databaseUrl) {
        Map<String, Object> settings = new HashMap<>();
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return settings;
        }
        String value = databaseUrl.trim();
        if (value.startsWith("jdbc:")) {
            value = value.substring("jdbc:".length());
        }
        if (!value.startsWith("postgres://") && !value.startsWith("postgresql://")) {
            return settings;
        }
        URI uri = URI.create(value);
        String username = "";
        String password = "";
        if (uri.getRawUserInfo() != null) {
            String[] parts = uri.getRawUserInfo().split(":", 2);
            username = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
            password = parts.length > 1 ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8) : "";
        }
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getRawPath()
                + (uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery());
        settings.put("spring.datasource.url", jdbcUrl);
        settings.put("spring.datasource.username", username);
        settings.put("spring.datasource.password", password);
        return settings;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
