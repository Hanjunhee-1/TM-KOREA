import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ENUM_VARCHAR_LENGTH, EnrollmentStatus } from '../enums';
import { TimestampedEntity } from './base.entity';
import { Student } from './student.entity';

@Entity({ name: 'student_enrollments' })
@Index(['studentId', 'status'])
@Unique('uq_student_enrollments_active', ['activeStudentId'])
export class StudentEnrollment extends TimestampedEntity {
  @Index()
  @Column({ name: 'student_id', type: 'char', length: 36 })
  studentId!: string;

  @ManyToOne(() => Student, (student) => student.enrollments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'started_at', type: 'date' })
  startedAt!: string;

  @Column({ name: 'ended_at', type: 'date', nullable: true })
  endedAt!: string | null;

  @Column({ type: 'varchar', length: ENUM_VARCHAR_LENGTH })
  status!: EnrollmentStatus;

  @Column({
    name: 'active_student_id',
    type: 'char',
    length: 36,
    nullable: true,
    insert: false,
    update: false,
    generatedType: 'STORED',
    asExpression: `IF(status = 'ACTIVE', student_id, NULL)`,
  })
  activeStudentId!: string | null;
}
