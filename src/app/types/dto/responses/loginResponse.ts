export interface LoginResponse {
  token: string;
  tokenExpires: number;
  role: string;
  exception: string;
  message: string;
}
