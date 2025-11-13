export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileBody {
  name?: string;
  email?: string;
}

export interface UpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
}