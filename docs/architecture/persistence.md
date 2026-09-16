# TM-KOREA persistence architecture

This is the first-pass domain model. It is intentionally small: confirmed academy/document concepts are modeled, and later PoC findings should extend these tables instead of replacing them.

## A. ERD

```text
users 1──0..1 students
                ├── 1──* student_enrollments
                ├── 1──* student_school_history
                └── *──* courses                 (via course_students)
                              │
                              *──* documents     (via course_documents)
                                        │
                                        ├── 1──* document_versions
                                        │           ▲
                                        │           │ current_version_id
                                        └── 1──* document_assignments ──▶ students
                                                      │
                                                      └── document_version_id (frozen copy)

document_versions.object_key ──▶ MinIO
documents (live editing state) ──▶ Redis
```

`COURSES.student_id` is not used. Students and courses are associated only through `course_students`, so a student can join many courses over time and a course can have many students.

## B. Tables

### users
Login accounts. `role` is application-level (`ADMIN` / `TEACHER` / `STUDENT`). Passwords are stored only as hashes. Soft-deleted.

### students
Academy student records. `user_id` is nullable so a student can exist without a login. Current enrollment and grade are **not** stored here.

### student_enrollments
Admission / withdrawal history. Current status is derived from `status = ACTIVE` and `ended_at IS NULL`. Re-admission is a new row.

### student_school_history
School name, level, grade, and class over time. The open row (`ended_at IS NULL`) is the current school record. Promotion logic is not implemented.

### courses
Academy course catalog. `type` distinguishes `SCHOOL` vs `ACADEMIC` without subtype tables. `teacher_id` is optional until teacher-course cardinality is confirmed.

### course_students
Course membership history. Same student may leave and rejoin; only one `ACTIVE` membership per (course, student) is allowed.

### documents
Central source document (the academy original), not a student copy. `current_version_id` is the optimistic-lock pointer used on save.

### document_versions
Immutable version history. Binary lives in MinIO; MySQL stores `object_key`, display `file_name`, author, and optional JSON `metadata`. No `updated_at` because versions are not edited in place.

### course_documents
Optional course-to-document link. Presence of the table does not decide product behavior; assignment vs course-owned materials is still a PoC question.

### document_assignments
Assigns a **specific version** to a student. Later source edits do not rewrite this row’s `document_version_id`.

## C. PK / FK / indexes

- PK: UUID v7 `CHAR(36)` everywhere except `course_documents` (`course_id`, `document_id`).
- Status / role / type columns are `VARCHAR(32)`, not MySQL ENUM, so PoC values can be added without `ALTER TABLE ... ENUM`.
- Generated unique columns enforce one active enrollment, one current school row, and one active course membership.
- Version rows use `ON DELETE RESTRICT` from documents so history cannot cascade away.
- `documents.current_version_id` is `ON DELETE SET NULL` to break the circular FK.
- Junction `course_documents` uses `ON DELETE CASCADE` because it is only a link.
- Soft delete (`deleted_at`) is on `users`, `students`, `courses`, `documents` only.

## D. MySQL schema / migration

- ORM: TypeORM 0.3 (`synchronize: false`).
- Migration: `backend/src/database/migrations/20260916120000-InitCoreDomainSchema.ts`
- Bootstrap without MySQL remains possible until `DATABASE_HOST` is set.

```bash
docker compose up -d
cp backend/.env.example backend/.env
cd backend
npm run migration:run
npm run seed
```

## E. Redis

Prefix: `tm-korea` (`REDIS_KEY_PREFIX`).

| Key | Purpose | TTL |
| --- | --- | --- |
| `tm-korea:document:{id}:presence` | connected users / heartbeat set | 45s |
| `tm-korea:document:{id}:lock` | optional advisory lock, not exclusive-editor policy | 120s |
| `tm-korea:document:{id}:session:{sessionId}` | per-tab session | 300s |

Redis is not the source of truth for versions. Browser crashes must not leave a permanent lock; TTL plus heartbeat refresh is the policy. CRDT/OT is out of scope; save conflicts are detected with `documents.current_version_id`.

## F. MinIO object keys

```text
documents/{documentId}/versions/{versionId}.{ext}
```

Example: `documents/100.../versions/3a....hwpx`

`file_name` stays in MySQL as the human-visible name. Keys use immutable ids, not version numbers, so a later numbering policy change does not orphan objects.

## G. Extension points

| Future feature | Add |
| --- | --- |
| Student worksheet assignment | already `document_assignments` |
| Student solving / submit | `submissions` → `document_assignments.id` |
| Grading | `gradings` → `submissions.id` |
| Document sharing | `document_shares` (user/role/course) |
| Teacher permissions | keep `users.role`; add `document_acl` or course-role if needed |
| Course-owned materials | use `course_documents`; do not collapse into `documents.course_id` |
| SCHOOL/ACADEMIC extra fields | `school_course_details` / `academic_course_details` keyed by `courses.id` |

Do not implement those tables until PoC confirms the workflow.

## H. Not decided yet (confirm on academy visit)

- Whether students always have logins
- How grade promotion is performed
- Whether a document belongs to a course, a teacher, or both
- Whether assigned worksheets stay frozen on a version or follow HEAD
- Problem sheet vs answer sheet modeling
- Submit / grade process
- How version history is used in daily teaching
- Whether one-editor locking is needed after all

## ID strategy

UUID v7 in the application (`createEntityId()`): time-sortable, no sequence leak in APIs, acceptable secondary-index size as `CHAR(36)`, and no extra dependency on MySQL autoincrement. Use this for every new table unless a later standard says otherwise.
