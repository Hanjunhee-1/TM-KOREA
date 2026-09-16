import { Course } from './course.entity';
import { CourseDocument } from './course-document.entity';
import { CourseStudent } from './course-student.entity';
import { Document } from './document.entity';
import { DocumentAssignment } from './document-assignment.entity';
import { DocumentVersion } from './document-version.entity';
import { Student } from './student.entity';
import { StudentEnrollment } from './student-enrollment.entity';
import { StudentSchoolHistory } from './student-school-history.entity';
import { User } from './user.entity';

export const databaseEntities = [
  User,
  Student,
  StudentEnrollment,
  StudentSchoolHistory,
  Course,
  CourseStudent,
  Document,
  DocumentVersion,
  CourseDocument,
  DocumentAssignment,
];

export {
  Course,
  CourseDocument,
  CourseStudent,
  Document,
  DocumentAssignment,
  DocumentVersion,
  Student,
  StudentEnrollment,
  StudentSchoolHistory,
  User,
};
