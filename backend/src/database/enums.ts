export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export enum CourseType {
  SCHOOL = 'SCHOOL',
  ACADEMIC = 'ACADEMIC',
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

export enum CourseStudentStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

export enum DocumentAssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  CANCELLED = 'CANCELLED',
}

export enum DocumentExtension {
  HWP = 'hwp',
  HWPX = 'hwpx',
}

export const ENUM_VARCHAR_LENGTH = 32;
