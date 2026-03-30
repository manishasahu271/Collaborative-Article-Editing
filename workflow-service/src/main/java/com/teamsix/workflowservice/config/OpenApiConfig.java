package com.teamsix.workflowservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI workflowServiceOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("Workflow Service API")
						.description("Editorial workflow — assign editors, reviewer feedback, track changes")
						.version("1.0.0"));
	}
}
