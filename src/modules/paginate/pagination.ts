import {
  PaginationMeta,
  PaginationResultInterface,
} from 'src/modules/paginate/pagination.results.interface';

export class Pagination<PaginationEntity> {
  public results: PaginationEntity[];
  public meta: PaginationMeta;

  constructor(paginationResults: PaginationResultInterface<PaginationEntity>) {
    this.results = paginationResults.results;
    this.meta = {
      lastPage: paginationResults.meta.lastPage,
      currentPage: paginationResults.meta.currentPage,
      total: paginationResults.meta.total,
      perPage: paginationResults.meta.perPage,
      next: paginationResults.meta.next,
      previous: paginationResults.meta.previous,
    };
  }
}

// export const createPaginator = (defaultOptions: PaginateOptions): PaginateFunction => {
//   return async (model, args: any = { where: undefined }, options) => {
//     const page = Number(options?.page || defaultOptions?.page) || 1
//     const perPage = Number(options?.perPage || defaultOptions?.perPage) || 10

//     const skip = page > 0 ? perPage * (page - 1) : 0
//     const [total, data] = await Promise.all([
//       model.count({ where: args.where }),
//       model.findMany({
//         ...args,
//         take: perPage,
//         skip,
//       }),
//     ])
//     const lastPage = Math.ceil(total / perPage)

//     return {
//       data,
//       meta: {
//         total,
//         lastPage,
//         currentPage: page,
//         perPage,
//         prev: page > 1 ? page - 1 : null,
//         next: page < lastPage ? page + 1 : null,
//       },
//     }
//   }
// }
