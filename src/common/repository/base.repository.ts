// import { PrismaService } from '../database/config.database';
import { PrismaClient } from '@prisma/client';
import { NotFoundException } from 'src/exception/not-found.exception';
import { Pagination } from 'src/modules/paginate';


import { DeepPartial, Repository } from './type.repository';

export abstract class BaseRepository<Entity>
  implements Repository<Entity>
{
  private readonly ORM: PrismaClient;
  private readonly table_name: string;
  
  
  protected constructor(tablename: string, ORM: PrismaClient) {
    this.ORM = ORM;
    this.table_name = tablename;
  }
  create(data: Entity): Promise<Entity | null> {
    return this.ORM[this.table_name.toString()].create({ data });
  }

  delete(id: string): Promise<void> {
    return this.ORM[this.table_name.toString()].delete({
      where: {
        id: id,
      },
    });
  }

  update(id: string, data: DeepPartial<Entity>): Promise<Entity | null> {
    return this.ORM[this.table_name.toString()].update({
      where: {
        id: id,
      },
      data,
    });
  }

  async findAll(
    findOptions = {},
    include?
  ): Promise<Entity[]> {
    try {
      const results = await this.ORM[this.table_name.toString()].findMany({
        ...findOptions,
        include,
      });

      return results;
    } catch (error) {
      console.log(error);

      return [];
    }
  }

  /***
   * find and count entity
   * @param findOptions
   * @param include
   * @param transformOptions
   */
  async findAndCount(
    findOptions = {},
    include?
  ): Promise<[Entity[], number]> {
    try {
      const results = await this.ORM[this.table_name.toString()].findMany({
        ...findOptions,
        include,
      });

      return [results, results.length];
    } catch (error) {
      console.log(error);

      return [null, 0];
    }
  }

  /***
   * find entity by id
   * @param id
   * @param include
   * @param transformOptions
   */
  findOne(id: string, include?): Promise<Entity | null> {
    return this.ORM[this.table_name.toString()]
      .findFirst({
        where: {
          id: id,
        },
        include,
      })
      .then((entity) => {
        if (!entity) {
          return Promise.reject(new NotFoundException());
        }
        
        return Promise.resolve(
          entity ? entity : null,
        );
      })
      .catch((error) => Promise.reject(error));
  }

  
  /**
   * find by condition
   * @param fieldName
   * @param value
   * @param include
   * @param transformOptions
   */
  async findBy(
    fieldName: string,
    value: any,
    include?
  ): Promise<Entity | null> {
    return this.ORM[this.table_name.toString()]
      .findFirst({
        where: {
          [fieldName]: value,
        },
        include,
      })
      .then((entity) => {
        if (!entity) {
          return null; //Promise.reject(new NotFoundException()); see if can use this instead
        }

        return Promise.resolve(
          entity ? entity : null,
        );
      })
      .catch((error) => Promise.reject(error));
  }

  /**
   * get count of entity by condition
   * @param findOptions
   */
  async countEntityByCondition(findOptions = {}): Promise<number> {
    return this.ORM[this.table_name.toString()]
      .count({
        ...findOptions,
      })
      .then((count) => {
        return Promise.resolve(count);
      })
      .catch((error) => Promise.reject(error));
  }

  

  
}
