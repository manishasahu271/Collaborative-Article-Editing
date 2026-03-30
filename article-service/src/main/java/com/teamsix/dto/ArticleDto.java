package com.teamsix.dto;

import com.teamsix.util.Status;
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
public class ArticleDto {
	private Long srNo;
	private String articleId;
	private String title;
	private String content;
	private Status status;
	private LocalDateTime creationDate;
	private Date lastModifiedDate;
	private Integer currentVersionId;
	private UserDto user;
}
