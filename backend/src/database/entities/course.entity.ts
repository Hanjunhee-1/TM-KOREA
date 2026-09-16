import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CourseType, ENUM_VARCHAR_LENGTH } from '../enums';
import { SoftDeletableEntity } from './base.entity';
import { CourseDocument } from './course-document.entity';
import { CourseStudent } from './course-student.entity';
import { User } from './user.entity';

@Entity({ name: 'courses' })
export class Course extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: ENUM_VARCHAR_LENGTH })
  type!: CourseType;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index()
  @Column({ name: 'teacher_id', type: 'char', length: 36, nullable: true })
  teacherId!: string | null;

  @ManyToOne(() => User, (user) => user.taughtCourses, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher!: User | null;

  @OneToMany(() => CourseStudent, (membership) => membership.course)
  students!: CourseStudent[];

  @OneToMany(() => CourseDocument, (link) => link.course)
  documents!: CourseDocument[];
}
