import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { DocumentAssignmentStatus, ENUM_VARCHAR_LENGTH } from '../enums';
import { TimestampedEntity } from './base.entity';
import { Document } from './document.entity';
import { DocumentVersion } from './document-version.entity';
import { Student } from './student.entity';
import { User } from './user.entity';

@Entity({ name: 'document_assignments' })
@Index(['documentId', 'studentId'])
export class DocumentAssignment extends TimestampedEntity {
  @Index()
  @Column({ name: 'document_id', type: 'char', length: 36 })
  documentId!: string;

  @ManyToOne(() => Document, (document) => document.assignments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @Index()
  @Column({ name: 'document_version_id', type: 'char', length: 36 })
  documentVersionId!: string;

  @ManyToOne(() => DocumentVersion, (version) => version.assignments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'document_version_id' })
  documentVersion!: DocumentVersion;

  @Index()
  @Column({ name: 'student_id', type: 'char', length: 36 })
  studentId!: string;

  @ManyToOne(() => Student, (student) => student.documentAssignments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'assigned_by', type: 'char', length: 36 })
  assignedById!: string;

  @ManyToOne(() => User, (user) => user.assignedDocuments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'assigned_by' })
  assignedBy!: User;

  @Column({ name: 'assigned_at', type: 'datetime', precision: 3 })
  assignedAt!: Date;

  @Column({ name: 'due_at', type: 'datetime', precision: 3, nullable: true })
  dueAt!: Date | null;

  @Column({ type: 'varchar', length: ENUM_VARCHAR_LENGTH })
  status!: DocumentAssignmentStatus;
}
