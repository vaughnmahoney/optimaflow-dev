
export type UserRole = 'admin' | 'qc_reviewer' | 'supervisor';

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface CreateUserParams {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}
