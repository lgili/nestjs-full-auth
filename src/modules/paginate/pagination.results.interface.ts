// export interface PaginationResultInterface<PaginationEntity> {
//   results: PaginationEntity[];
//   currentPage: number;
//   pageSize: number;
//   totalItems: number;
//   next: number;
//   previous: number;
// }

export interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  previous: number | null;
  next: number | null;
}
export interface PaginationResultInterface<T> {
  results: T[];
  meta: PaginationMeta;
}
