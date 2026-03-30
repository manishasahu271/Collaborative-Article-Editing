package com.teamsix.config;

import com.teamsix.event.ArticleStatusEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class KafkaConsumerConfig {

	@Value("${spring.kafka.bootstrap-servers:localhost:9092}")
	private String bootstrapServers;

	@Bean
	public ConsumerFactory<String, ArticleStatusEvent> consumerFactory() {
		Map<String, Object> props = new HashMap<>();
		props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
		props.put(ConsumerConfig.GROUP_ID_CONFIG, "article-service-group");

		JsonDeserializer<ArticleStatusEvent> jsonDeserializer = new JsonDeserializer<>(ArticleStatusEvent.class);
		jsonDeserializer.addTrustedPackages("com.teamsix.event", "com.teamsix.workflowservice.event");
		jsonDeserializer.setUseTypeHeaders(false);

		ErrorHandlingDeserializer<ArticleStatusEvent> errorHandlingDeserializer =
				new ErrorHandlingDeserializer<>(jsonDeserializer);

		return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), errorHandlingDeserializer);
	}

	@Bean
	public ConcurrentKafkaListenerContainerFactory<String, ArticleStatusEvent> kafkaListenerContainerFactory() {
		ConcurrentKafkaListenerContainerFactory<String, ArticleStatusEvent> factory =
				new ConcurrentKafkaListenerContainerFactory<>();
		factory.setConsumerFactory(consumerFactory());
		return factory;
	}
}
