package com.teamsix.workflowservice.payload;

import com.teamsix.workflowservice.utils.Status;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class ArticleDto {
	private Long srNo;
	private String articleId;
	private String title;
	private String content;
	private Status status;
	private LocalDateTime creationDate;
	private Date lastModifiedDate;
	private Integer currentVersionId;
	@Embedded
	private UserDto user;
}
