package com.example.versioncontrolservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI versionControlServiceOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("Version Control Service API")
						.description("Tracks article version metadata, compares versions")
						.version("1.0.0"));
	}
}
