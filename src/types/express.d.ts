declare namespace Express {
  export interface Request {
    body: {
      email?: string;
      phoneNumber?: number | string;
    };
  }
}