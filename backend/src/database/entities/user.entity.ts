import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { ENUM_VARCHAR_LENGTH, UserRole } from '../enums';
import { SoftDeletableEntity } from './base.entity';
import { Course } from './course.entity';
import { Document } from './document.entity';
import { DocumentAssignment } from './document-assignment.entity';
import { DocumentVersion } from './document-version.entity';
import { Student } from './student.entity';

@Entity({ name: 'users' })
export class User extends SoftDeletableEntity {
  @Index({ unique: true })
  @Column({ name: 'login_id', type: 'varchar', length: 50 })
  loginId!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: ENUM_VARCHAR_LENGTH })
  role!: UserRole;

  @OneToOne(() => Student, (student) => student.user)
  student!: Student | null;

  @OneToMany(() => Course, (course) => course.teacher)
  taughtCourses!: Course[];

  @OneToMany(() => Document, (document) => document.createdBy)
  createdDocuments!: Document[];

  @OneToMany(() => DocumentVersion, (version) => version.createdBy)
  createdDocumentVersions!: DocumentVersion[];

  @OneToMany(() => DocumentAssignment, (assignment) => assignment.assignedBy)
  assignedDocuments!: DocumentAssignment[];
}
