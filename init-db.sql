CREATE DATABASE IF NOT EXISTS articledb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS userdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS versiondb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS hack3 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE articledb;

CREATE TABLE IF NOT EXISTS article (
  sr_no BIGINT NOT NULL AUTO_INCREMENT,
  article_id VARCHAR(255) DEFAULT NULL,
  title VARCHAR(255) DEFAULT NULL,
  content TEXT,
  status ENUM('in_progress','approved','rejected') NOT NULL DEFAULT 'in_progress',
  creation_date DATETIME(6) DEFAULT NULL,
  last_modified_date DATETIME(6) DEFAULT NULL,
  current_version_id INT DEFAULT 1,
  user_id BIGINT DEFAULT NULL,
  PRIMARY KEY (sr_no),
  KEY idx_article_article_id (article_id),
  KEY idx_article_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

USE userdb;

CREATE TABLE IF NOT EXISTS `user` (
  user_id BIGINT NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) DEFAULT NULL,
  role VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY uk_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

USE versiondb;

CREATE TABLE IF NOT EXISTS version_tracking (
  version_id INT NOT NULL,
  article_id VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (version_id),
  KEY idx_version_tracking_article_id (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

USE hack3;

CREATE TABLE IF NOT EXISTS reviewer_feedback (
  id VARCHAR(255) NOT NULL,
  reviewer_user_id VARCHAR(255) DEFAULT NULL,
  review_status VARCHAR(255) DEFAULT NULL,
  review_feedback TEXT,
  review_time_stamp VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS editor_changes (
  id VARCHAR(255) NOT NULL,
  editor_user_id VARCHAR(255) DEFAULT NULL,
  changed_time_stamp VARCHAR(255) DEFAULT NULL,
  changed_description TEXT,
  author_comment TEXT,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS work_flow (
  id VARCHAR(255) NOT NULL,
  sr_no BIGINT DEFAULT NULL,
  article_id VARCHAR(255) DEFAULT NULL,
  title VARCHAR(255) DEFAULT NULL,
  content TEXT,
  status ENUM('in_progress','approved','rejected') DEFAULT NULL,
  creation_date DATETIME(6) DEFAULT NULL,
  last_modified_date DATETIME(6) DEFAULT NULL,
  current_version_id INT DEFAULT NULL,
  user_id BIGINT DEFAULT NULL,
  username VARCHAR(255) DEFAULT NULL,
  role VARCHAR(255) DEFAULT NULL,
  editor_user_id VARCHAR(255) DEFAULT NULL,
  reviewer_user_id VARCHAR(255) DEFAULT NULL,
  submission_date VARCHAR(255) DEFAULT NULL,
  approval_date VARCHAR(255) DEFAULT NULL,
  rejection_reason TEXT,
  reviewer_feedback_id VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_work_flow_article_id (article_id),
  CONSTRAINT fk_work_flow_reviewer_feedback FOREIGN KEY (reviewer_feedback_id) REFERENCES reviewer_feedback (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS work_flow_editor_changes_list (
  work_flow_id VARCHAR(255) NOT NULL,
  editor_changes_list_id VARCHAR(255) NOT NULL,
  KEY fk_wf_ec_list_wf (work_flow_id),
  KEY fk_wf_ec_list_ec (editor_changes_list_id),
  CONSTRAINT fk_wf_ec_list_wf FOREIGN KEY (work_flow_id) REFERENCES work_flow (id),
  CONSTRAINT fk_wf_ec_list_ec FOREIGN KEY (editor_changes_list_id) REFERENCES editor_changes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
