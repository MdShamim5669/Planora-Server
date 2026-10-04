export interface IQueryParams {
  search?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sort?: string;
  page?: string | number;
  limit?: string | number;
  fields?: string;
  [key: string]: any;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IQueryResult<T> {
  data: T[];
  meta: IPaginationMeta;
}
