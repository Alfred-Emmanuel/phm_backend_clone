export interface IJwtData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface ITokenDetails {
  user: {
    id: string;
    email: string;
  };
  token: string;
  expiration: Date;
}
