import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { UuidEntity } from './base.entity';
import { Document } from './document.entity';
import { DocumentAssignment } from './document-assignment.entity';
import { User } from './user.entity';

@Entity({ name: 'document_versions' })
@Unique('uq_document_versions_number', ['documentId', 'versionNumber'])
export class DocumentVersion extends UuidEntity {
  @Index()
  @Column({ name: 'document_id', type: 'char', length: 36 })
  documentId!: string;

  @ManyToOne(() => Document, (document) => document.versions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @Column({ name: 'version_number', type: 'int', unsigned: true })
  versionNumber!: number;

  @Column({ name: 'object_key', type: 'varchar', length: 512 })
  objectKey!: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ name: 'created_by', type: 'char', length: 36 })
  createdById!: string;

  @ManyToOne(() => User, (user) => user.createdDocumentVersions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, unknown> | null;

  @OneToMany(
    () => DocumentAssignment,
    (assignment) => assignment.documentVersion,
  )
  assignments!: DocumentAssignment[];
}
