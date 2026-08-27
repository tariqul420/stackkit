export interface IUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  image: string;
  status: string;
  isDeleted: boolean;
  emailVerified: boolean;
  needPasswordChange: boolean;
  createdAt?: string;
}
