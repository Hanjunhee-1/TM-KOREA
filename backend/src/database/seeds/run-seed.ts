import * as bcrypt from 'bcryptjs';
import { IsNull, Repository } from 'typeorm';
import { createEntityId } from '../../common/id/create-entity-id';
import { createDataSource } from '../data-source';
import { Course } from '../entities/course.entity';
import { Student } from '../entities/student.entity';
import { StudentEnrollment } from '../entities/student-enrollment.entity';
import { StudentSchoolHistory } from '../entities/student-school-history.entity';
import { User } from '../entities/user.entity';
import { CourseType, EnrollmentStatus, UserRole } from '../enums';

async function upsertUser(
  users: Repository<User>,
  loginId: string,
  role: UserRole,
  password: string,
): Promise<User> {
  const existing = await users.findOne({
    where: { loginId },
    withDeleted: true,
  });
  if (existing) {
    return existing;
  }

  return users.save(
    users.create({
      id: createEntityId(),
      loginId,
      role,
      passwordHash: await bcrypt.hash(password, 10),
    }),
  );
}

async function seed(): Promise<void> {
  const dataSource = createDataSource();
  await dataSource.initialize();

  try {
    const users = dataSource.getRepository(User);
    const students = dataSource.getRepository(Student);
    const enrollments = dataSource.getRepository(StudentEnrollment);
    const schoolHistory = dataSource.getRepository(StudentSchoolHistory);
    const courses = dataSource.getRepository(Course);

    await upsertUser(
      users,
      'admin',
      UserRole.ADMIN,
      process.env.SEED_ADMIN_PASSWORD ?? 'change-me-admin',
    );
    const teacher = await upsertUser(
      users,
      'teacher',
      UserRole.TEACHER,
      process.env.SEED_TEACHER_PASSWORD ?? 'change-me-teacher',
    );

    let student = await students.findOne({ where: { name: '홍길동' } });
    if (!student) {
      student = await students.save(
        students.create({
          id: createEntityId(),
          userId: null,
          name: '홍길동',
          phone: '010-0000-0000',
          birthDate: '2012-03-01',
        }),
      );
    }

    const activeEnrollment = await enrollments.findOne({
      where: { studentId: student.id, status: EnrollmentStatus.ACTIVE },
    });
    if (!activeEnrollment) {
      await enrollments.save(
        enrollments.create({
          id: createEntityId(),
          studentId: student.id,
          startedAt: '2026-03-01',
          endedAt: null,
          status: EnrollmentStatus.ACTIVE,
        }),
      );
    }

    const currentSchool = await schoolHistory.findOne({
      where: { studentId: student.id, endedAt: IsNull() },
    });
    if (!currentSchool) {
      await schoolHistory.save(
        schoolHistory.create({
          id: createEntityId(),
          studentId: student.id,
          schoolName: '서울중학교',
          schoolLevel: 'MIDDLE',
          grade: '2',
          className: '3',
          startedAt: '2026-03-01',
          endedAt: null,
        }),
      );
    }

    const existingCourse = await courses.findOne({
      where: { name: '중2 수학' },
    });
    if (!existingCourse) {
      await courses.save(
        courses.create({
          id: createEntityId(),
          type: CourseType.SCHOOL,
          name: '중2 수학',
          description: 'PoC 샘플 과정',
          teacherId: teacher.id,
        }),
      );
    }

    console.log('Seed completed.');
  } finally {
    await dataSource.destroy();
  }
}

void seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
