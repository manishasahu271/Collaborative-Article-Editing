package com.teamsix.workflowservice.event;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class ArticleStatusProducer {

	private static final String TOPIC = "article-status-events";

	private final KafkaTemplate<String, ArticleStatusEvent> kafkaTemplate;

	public ArticleStatusProducer(KafkaTemplate<String, ArticleStatusEvent> kafkaTemplate) {
		this.kafkaTemplate = kafkaTemplate;
	}

	public void publishStatusChange(ArticleStatusEvent event) {
		kafkaTemplate.send(TOPIC, event.getArticleId(), event);
	}
}
