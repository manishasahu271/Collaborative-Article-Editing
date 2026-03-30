package com.teamsix.event;

import com.teamsix.service.ArticleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class ArticleStatusConsumer {

	private static final Logger log = LoggerFactory.getLogger(ArticleStatusConsumer.class);

	private final ArticleService articleService;

	public ArticleStatusConsumer(ArticleService articleService) {
		this.articleService = articleService;
	}

	@KafkaListener(topics = "article-status-events", groupId = "article-service-group",
			containerFactory = "kafkaListenerContainerFactory")
	public void consume(ArticleStatusEvent event) {
		try {
			articleService.setArticleStatus(event.getArticleId(), event.getNewStatus());
		} catch (Exception e) {
			log.error("Error processing article status event: {}", e.getMessage(), e);
		}
	}
}
