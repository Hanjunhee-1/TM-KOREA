import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { SoftDeletableEntity } from './base.entity';
import { CourseStudent } from './course-student.entity';
import { DocumentAssignment } from './document-assignment.entity';
import { StudentEnrollment } from './student-enrollment.entity';
import { StudentSchoolHistory } from './student-school-history.entity';
import { User } from './user.entity';

@Entity({ name: 'students' })
export class Student extends SoftDeletableEntity {
  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'char', length: 36, nullable: true })
  userId!: string | null;

  @OneToOne(() => User, (user) => user.student, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate!: string | null;

  @OneToMany(() => StudentEnrollment, (enrollment) => enrollment.student)
  enrollments!: StudentEnrollment[];

  @OneToMany(() => StudentSchoolHistory, (history) => history.student)
  schoolHistory!: StudentSchoolHistory[];

  @OneToMany(() => CourseStudent, (membership) => membership.student)
  courseMemberships!: CourseStudent[];

  @OneToMany(() => DocumentAssignment, (assignment) => assignment.student)
  documentAssignments!: DocumentAssignment[];
}
