import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SoftDeletableEntity } from './base.entity';
import { CourseDocument } from './course-document.entity';
import { DocumentAssignment } from './document-assignment.entity';
import { DocumentVersion } from './document-version.entity';
import { User } from './user.entity';

@Entity({ name: 'documents' })
export class Document extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 16 })
  extension!: string;

  @Index()
  @Column({
    name: 'current_version_id',
    type: 'char',
    length: 36,
    nullable: true,
  })
  currentVersionId!: string | null;

  @ManyToOne(() => DocumentVersion, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'current_version_id' })
  currentVersion!: DocumentVersion | null;

  @Index()
  @Column({ name: 'created_by', type: 'char', length: 36 })
  createdById!: string;

  @ManyToOne(() => User, (user) => user.createdDocuments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @OneToMany(() => DocumentVersion, (version) => version.document)
  versions!: DocumentVersion[];

  @OneToMany(() => DocumentAssignment, (assignment) => assignment.document)
  assignments!: DocumentAssignment[];

  @OneToMany(() => CourseDocument, (link) => link.document)
  courses!: CourseDocument[];
}
