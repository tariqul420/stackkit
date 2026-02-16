import { Response } from "express";

interface IResponseData<T> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendResponse = <T>(res: Response, responseData: IResponseData<T>) => {
  const { status, success, message, data, meta } = responseData;

  res.status(status).json({
    success,
    message,
    data,
    meta,
  });
};
