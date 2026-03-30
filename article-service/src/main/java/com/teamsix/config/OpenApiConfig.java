package com.teamsix.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI articleServiceOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("Article Service API")
						.description("Manages articles with versioning, CRUD operations, and status tracking")
						.version("1.0.0"));
	}
}
