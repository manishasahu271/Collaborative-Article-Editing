package com.example.versioncontrolservice.Dto;

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
	private String status;
	private LocalDateTime creationDate;
	private Date lastModifiedDate;
	private Integer currentVersionId;
	private Object user;
}
