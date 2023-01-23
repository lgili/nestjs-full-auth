import { Pagination } from "src/modules/paginate";


interface Reader<Entity> {
    findAll(
      searchFilter: any,      
      include: any
    ): Promise<Entity[]>;

    findOne(id: string,
      include: any
      ): Promise<Entity | null>;

    findBy(
      fieldName: string,
      value: string,
      include: any): Promise<Entity | null>;

    countEntityByCondition(
        conditions: ObjectLiteral
      ): Promise<number> ;  
    
    findAndCount(
      searchFilter: any,      
      include: any
    ): Promise<[Entity[],number]>;

    
    
  }
  interface Writer<Entity> {
    create(data: Entity): Promise<Entity | null>;
    update(id: string, data: DeepPartial<Entity>): Promise<Entity | null>;
    delete(id: string): Promise<void>;
  }
  export type Repository<Entity> = Reader<Entity> & Writer<Entity>;

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
  [P in keyof T]?: (T[P] extends Array<infer U> ? Array<QueryDeepPartialEntity<U>> : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<QueryDeepPartialEntity<U>> : QueryDeepPartialEntity<T[P]>) | (() => string);
};