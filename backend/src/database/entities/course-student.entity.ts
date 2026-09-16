import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CourseStudentStatus, ENUM_VARCHAR_LENGTH } from '../enums';
import { TimestampedEntity } from './base.entity';
import { Course } from './course.entity';
import { Student } from './student.entity';

@Entity({ name: 'course_students' })
@Index(['courseId', 'studentId'])
@Unique('uq_course_students_active', ['activeMembershipKey'])
export class CourseStudent extends TimestampedEntity {
  @Index()
  @Column({ name: 'course_id', type: 'char', length: 36 })
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.students, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Index()
  @Column({ name: 'student_id', type: 'char', length: 36 })
  studentId!: string;

  @ManyToOne(() => Student, (student) => student.courseMemberships, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'started_at', type: 'date' })
  startedAt!: string;

  @Column({ name: 'ended_at', type: 'date', nullable: true })
  endedAt!: string | null;

  @Column({ type: 'varchar', length: ENUM_VARCHAR_LENGTH })
  status!: CourseStudentStatus;

  @Column({
    name: 'active_membership_key',
    type: 'varchar',
    length: 73,
    nullable: true,
    insert: false,
    update: false,
    generatedType: 'STORED',
    asExpression: `IF(status = 'ACTIVE', CONCAT(course_id, ':', student_id), NULL)`,
  })
  activeMembershipKey!: string | null;
}
