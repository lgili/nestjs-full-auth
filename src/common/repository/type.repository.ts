import { ClassTransformOptions } from 'class-transformer';

import { SearchFilterInterface } from '../interfaces/search-filter.interface';

interface Reader<Entity> {
  findAll(findOptions?: FindAllInterface<Entity>): Promise<Entity[]>;

  findOne(findOptions: FindByIdInterface<Entity>): Promise<Entity | null>;

  findBy(findOptions: FindByInterface<Entity>): Promise<Entity | null>;

  countEntityByCondition(conditions: ObjectLiteral): Promise<number>;

  findAndCount(
    findOptions?: FindAllInterface<Entity>,
  ): Promise<[Entity[], number]>;
}

interface Writer<Entity> {
  create(options: CreateInterface<Entity>): Promise<Entity | null>;
  update(options: UpdateInterface<Entity>): Promise<Entity | null>;
  delete(id: string): Promise<void>;
}
export type Repository<Entity> = Reader<Entity> & Writer<Entity>;

export interface CreateInterface<K> {
  data: K;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

export interface UpdateInterface<K> {
  id: string;
  data: DeepPartial<K>;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

export interface FindByIdInterface<K> {
  id: string;
  include?: any;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

export interface FindByInterface<K> {
  fieldName: string;
  value: string;
  include?: any;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

export interface FindAllInterface<K> {
  searchFilter: any;
  include?: any;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

export interface FindPaginateInterface<K> {
  searchFilter: DeepPartial<SearchFilterInterface>;
  include?: any;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

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

export declare type ClassConstructor<T> = {
  new (...args: any[]): T;
};
