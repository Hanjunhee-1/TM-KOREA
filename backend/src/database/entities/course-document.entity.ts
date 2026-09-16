import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Document } from './document.entity';

@Entity({ name: 'course_documents' })
export class CourseDocument {
  @PrimaryColumn({ name: 'course_id', type: 'char', length: 36 })
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Index()
  @PrimaryColumn({ name: 'document_id', type: 'char', length: 36 })
  documentId!: string;

  @ManyToOne(() => Document, (document) => document.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;
}
