import { Pagination } from 'src/modules/paginate';

interface Reader<T, K> {
  findAll(
    searchFilter: any,
    include: any,
    transformOptions: string[],
  ): Promise<K[]>;

  findOne(
    id: string,
    include: any,
    transformOptions: string[],
  ): Promise<K | null>;

  findBy(
    fieldName: string,
    value: string,
    include: any,
    transformOptions: any,
  ): Promise<K | null>;

  countEntityByCondition(conditions: ObjectLiteral): Promise<number>;

  findAndCount(
    searchFilter: any,
    include: any,
    transformOptions: string[],
  ): Promise<[T[], number]>;

  paginate(
    searchFilter: any,
    include: any,
    transformOptions: string[],
  ): Promise<Pagination<K>>;
}

interface Writer<T, K> {
  create(data: T): Promise<K | null>;
  update(id: string, data: DeepPartial<T>): Promise<K | null>;
  delete(id: string): Promise<void>;
}
export type Repository<T, K> = Reader<T, K> & Writer<T, K>;

/**
 * Interface of the simple literal object with any string keys.
 */
export interface ObjectLiteral {
  [key: string]: any;
}

/**
 * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
 */
export declare type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Make all properties in T optional
 */
export declare type QueryPartialEntity<T> = {
  [P in keyof T]?: T[P] | (() => string);
};
/**
 * Make all properties in T optional. Deep version.
 */
export declare type QueryDeepPartialEntity<T> = {
  [P in keyof T]?:
    | (T[P] extends Array<infer U>
        ? Array<QueryDeepPartialEntity<U>>
        : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<QueryDeepPartialEntity<U>>
        : QueryDeepPartialEntity<T[P]>)
    | (() => string);
};
