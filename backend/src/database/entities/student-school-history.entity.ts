import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { TimestampedEntity } from './base.entity';
import { Student } from './student.entity';

@Entity({ name: 'student_school_history' })
@Index(['studentId', 'startedAt'])
@Unique('uq_student_school_history_current', ['currentStudentId'])
export class StudentSchoolHistory extends TimestampedEntity {
  @Index()
  @Column({ name: 'student_id', type: 'char', length: 36 })
  studentId!: string;

  @ManyToOne(() => Student, (student) => student.schoolHistory, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'school_name', type: 'varchar', length: 200 })
  schoolName!: string;

  @Column({ name: 'school_level', type: 'varchar', length: 32, nullable: true })
  schoolLevel!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  grade!: string | null;

  @Column({ name: 'class_name', type: 'varchar', length: 50, nullable: true })
  className!: string | null;

  @Column({ name: 'started_at', type: 'date' })
  startedAt!: string;

  @Column({ name: 'ended_at', type: 'date', nullable: true })
  endedAt!: string | null;

  @Column({
    name: 'current_student_id',
    type: 'char',
    length: 36,
    nullable: true,
    insert: false,
    update: false,
    generatedType: 'STORED',
    asExpression: `IF(ended_at IS NULL, student_id, NULL)`,
  })
  currentStudentId!: string | null;
}
