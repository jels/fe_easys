export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  GUARDIAN = 'GUARDIAN',
  STUDENT = 'STUDENT',
}

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.TEACHER]: ['access.view', 'students.view', 'academics.manage'],
  [UserRole.ADMINISTRATIVE]: ['access.manage', 'students.manage', 'payments.manage'],
  [UserRole.GUARDIAN]: ['students.view', 'payments.view', 'notifications.view'],
  [UserRole.STUDENT]: ['profile.view', 'grades.view'],
};
