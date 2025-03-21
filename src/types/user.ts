
export type UserRole = "admin" | "qc_reviewer" | "supervisor" | "billing_admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  user_role: UserRole;
  role?: UserRole; // For backward compatibility
  created_at: string;
  last_sign_in_at?: string | null;
  is_active: boolean;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  user_role: UserRole;
}

export interface UpdateUserRoleData {
  id: string;
  role: UserRole;
}

export interface UpdateUserStatusData {
  id: string;
  is_active: boolean;
}
