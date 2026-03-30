package com.teamsix.event;

import java.io.Serializable;
import java.time.LocalDateTime;

public class ArticleStatusEvent implements Serializable {

	private static final long serialVersionUID = 1L;

	private String articleId;
	private String newStatus;
	private String changedBy;
	private String reason;
	private LocalDateTime timestamp;

	public ArticleStatusEvent() {
	}

	public ArticleStatusEvent(String articleId, String newStatus, String changedBy, String reason, LocalDateTime timestamp) {
		this.articleId = articleId;
		this.newStatus = newStatus;
		this.changedBy = changedBy;
		this.reason = reason;
		this.timestamp = timestamp;
	}

	public String getArticleId() {
		return articleId;
	}

	public void setArticleId(String articleId) {
		this.articleId = articleId;
	}

	public String getNewStatus() {
		return newStatus;
	}

	public void setNewStatus(String newStatus) {
		this.newStatus = newStatus;
	}

	public String getChangedBy() {
		return changedBy;
	}

	public void setChangedBy(String changedBy) {
		this.changedBy = changedBy;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}

	@Override
	public String toString() {
		return "ArticleStatusEvent{" +
				"articleId='" + articleId + '\'' +
				", newStatus='" + newStatus + '\'' +
				", changedBy='" + changedBy + '\'' +
				", reason='" + reason + '\'' +
				", timestamp=" + timestamp +
				'}';
	}
}
