export interface IGenericErrorMessage {
  field: string;
  message: string;
}

export interface IGenericErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  errors: IGenericErrorMessage[];
}
