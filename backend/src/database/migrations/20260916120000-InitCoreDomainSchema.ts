import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCoreDomainSchema20260916120000 implements MigrationInterface {
  name = 'InitCoreDomainSchema20260916120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id CHAR(36) NOT NULL,
        login_id VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        deleted_at DATETIME(3) NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_login_id (login_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE students (
        id CHAR(36) NOT NULL,
        user_id CHAR(36) NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(32) NULL,
        birth_date DATE NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        deleted_at DATETIME(3) NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_students_user_id (user_id),
        CONSTRAINT fk_students_user
          FOREIGN KEY (user_id) REFERENCES users (id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE student_enrollments (
        id CHAR(36) NOT NULL,
        student_id CHAR(36) NOT NULL,
        started_at DATE NOT NULL,
        ended_at DATE NULL,
        status VARCHAR(32) NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        active_student_id CHAR(36)
          GENERATED ALWAYS AS (IF(status = 'ACTIVE', student_id, NULL)) STORED,
        PRIMARY KEY (id),
        KEY idx_student_enrollments_student_id (student_id),
        KEY idx_student_enrollments_student_status (student_id, status),
        UNIQUE KEY uq_student_enrollments_active (active_student_id),
        CONSTRAINT fk_student_enrollments_student
          FOREIGN KEY (student_id) REFERENCES students (id)
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE student_school_history (
        id CHAR(36) NOT NULL,
        student_id CHAR(36) NOT NULL,
        school_name VARCHAR(200) NOT NULL,
        school_level VARCHAR(32) NULL,
        grade VARCHAR(16) NULL,
        class_name VARCHAR(50) NULL,
        started_at DATE NOT NULL,
        ended_at DATE NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        current_student_id CHAR(36)
          GENERATED ALWAYS AS (IF(ended_at IS NULL, student_id, NULL)) STORED,
        PRIMARY KEY (id),
        KEY idx_student_school_history_student_id (student_id),
        KEY idx_student_school_history_student_started (student_id, started_at),
        UNIQUE KEY uq_student_school_history_current (current_student_id),
        CONSTRAINT fk_student_school_history_student
          FOREIGN KEY (student_id) REFERENCES students (id)
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE courses (
        id CHAR(36) NOT NULL,
        type VARCHAR(32) NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT NULL,
        teacher_id CHAR(36) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        deleted_at DATETIME(3) NULL,
        PRIMARY KEY (id),
        KEY idx_courses_teacher_id (teacher_id),
        CONSTRAINT fk_courses_teacher
          FOREIGN KEY (teacher_id) REFERENCES users (id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE course_students (
        id CHAR(36) NOT NULL,
        course_id CHAR(36) NOT NULL,
        student_id CHAR(36) NOT NULL,
        started_at DATE NOT NULL,
        ended_at DATE NULL,
        status VARCHAR(32) NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        active_membership_key VARCHAR(73)
          GENERATED ALWAYS AS (IF(status = 'ACTIVE', CONCAT(course_id, ':', student_id), NULL)) STORED,
        PRIMARY KEY (id),
        KEY idx_course_students_course_id (course_id),
        KEY idx_course_students_student_id (student_id),
        KEY idx_course_students_course_student (course_id, student_id),
        UNIQUE KEY uq_course_students_active (active_membership_key),
        CONSTRAINT fk_course_students_course
          FOREIGN KEY (course_id) REFERENCES courses (id)
          ON DELETE RESTRICT,
        CONSTRAINT fk_course_students_student
          FOREIGN KEY (student_id) REFERENCES students (id)
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE documents (
        id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        extension VARCHAR(16) NOT NULL,
        current_version_id CHAR(36) NULL,
        created_by CHAR(36) NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        deleted_at DATETIME(3) NULL,
        PRIMARY KEY (id),
        KEY idx_documents_current_version_id (current_version_id),
        KEY idx_documents_created_by (created_by),
        CONSTRAINT fk_documents_created_by
          FOREIGN KEY (created_by) REFERENCES users (id)
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE document_versions (
        id CHAR(36) NOT NULL,
        document_id CHAR(36) NOT NULL,
        version_number INT UNSIGNED NOT NULL,
        object_key VARCHAR(512) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        created_by CHAR(36) NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        metadata JSON NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_document_versions_number (document_id, version_number),
        KEY idx_document_versions_document_id (document_id),
        CONSTRAINT fk_document_versions_document
          FOREIGN KEY (document_id) REFERENCES documents (id)
          ON DELETE RESTRICT,
        CONSTRAINT fk_document_versions_created_by
          FOREIGN KEY (created_by) REFERENCES users (id)
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      ALTER TABLE documents
        ADD CONSTRAINT fk_documents_current_version
          FOREIGN KEY (current_version_id) REFERENCES document_versions (id)
          ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE course_documents (
        course_id CHAR(36) NOT NULL,
        document_id CHAR(36) NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (course_id, document_id),
        KEY idx_course_documents_document_id (document_id),
        CONSTRAINT fk_course_documents_course
          FOREIGN KEY (course_id) REFERENCES courses (id)
          ON DELETE CASCADE,
        CONSTRAINT fk_course_documents_document
          FOREIGN KEY (document_id) REFERENCES documents (id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE document_assignments (
        id CHAR(36) NOT NULL,
        document_id CHAR(36) NOT NULL,
        document_version_id CHAR(36) NOT NULL,
        student_id CHAR(36) NOT NULL,
        assigned_by CHAR(36) NOT NULL,
        assigned_at DATETIME(3) NOT NULL,
        due_at DATETIME(3) NULL,
        status VARCHAR(32) NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY idx_document_assignments_document_id (document_id),
        KEY idx_document_assignments_document_version_id (document_version_id),
        KEY idx_document_assignments_student_id (student_id),
        KEY idx_document_assignments_document_student (document_id, student_id),
        CONSTRAINT fk_document_assignments_document
          FOREIGN KEY (document_id) REFERENCES documents (id)
          ON DELETE RESTRICT,
        CONSTRAINT fk_document_assignments_version
          FOREIGN KEY (document_version_id) REFERENCES document_versions (id)
          ON DELETE RESTRICT,
        CONSTRAINT fk_document_assignments_student
          FOREIGN KEY (student_id) REFERENCES students (id)
          ON DELETE RESTRICT,
        CONSTRAINT fk_document_assignments_assigned_by
          FOREIGN KEY (assigned_by) REFERENCES users (id)
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS document_assignments');
    await queryRunner.query('DROP TABLE IF EXISTS course_documents');
    await queryRunner.query(
      'ALTER TABLE documents DROP FOREIGN KEY fk_documents_current_version',
    );
    await queryRunner.query('DROP TABLE IF EXISTS document_versions');
    await queryRunner.query('DROP TABLE IF EXISTS documents');
    await queryRunner.query('DROP TABLE IF EXISTS course_students');
    await queryRunner.query('DROP TABLE IF EXISTS courses');
    await queryRunner.query('DROP TABLE IF EXISTS student_school_history');
    await queryRunner.query('DROP TABLE IF EXISTS student_enrollments');
    await queryRunner.query('DROP TABLE IF EXISTS students');
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}
