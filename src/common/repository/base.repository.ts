// import { PrismaService } from '../database/config.database';
import { PrismaClient } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { NotFoundException } from 'src/exception/not-found.exception';
import { Pagination } from 'src/modules/paginate';

import { ModelSerializer } from '../serializer/model.serializer';
import { DeepPartial, ObjectLiteral, Repository } from './type.repository';

export abstract class BaseRepository<T, K extends ModelSerializer>
  implements Repository<T, K>
{
  private readonly ORM: PrismaClient;
  private readonly table_name: string;
  protected constructor(tablename: string, ORM: PrismaClient) {
    this.ORM = ORM;
    this.table_name = tablename;
  }
  create(data: T): Promise<K | null> {
    return this.ORM[this.table_name.toString()].create({ data });
  }

  delete(id: string): Promise<void> {
    return this.ORM[this.table_name.toString()].delete({
      where: {
        id: id,
      },
    });
  }

  update(id: string, data: DeepPartial<T>): Promise<K | null> {
    return this.ORM[this.table_name.toString()].update({
      where: {
        id: id,
      },
      data,
    });
  }

  async findAll(
    findOptions = {},
    include?,
    transformOptions = {},
  ): Promise<K[]> {
    try {
      const results = await this.ORM[this.table_name.toString()].findMany({
        ...findOptions,
        include,
      });

      return this.transformMany(results, transformOptions);
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
    include?,
    transformOptions = {},
  ): Promise<[T[], number]> {
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
  findOne(id: string, include?, transformOptions = {}): Promise<K | null> {
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
          entity ? this.transform(entity, transformOptions) : null,
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
    include?,
    transformOptions = {},
  ): Promise<K | null> {
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
          entity ? this.transform(entity, transformOptions) : null,
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

  // need to test more
  async paginate(
    findOptions: { take: number; skip: number },
    include?,
    transformOptions = {},
  ): Promise<Pagination<K>> {
    const [results, total] = await this.findAndCount(findOptions);
    const serializedResult = this.transformMany(results, transformOptions);

    const limit = findOptions.take;
    const skip = findOptions.skip + 1;
    const page = findOptions.skip + 1;

    return new Pagination<K>({
      results: serializedResult,
      totalItems: total,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next: total > skip + limit ? page + 1 : 0,
    });
  }

  /**
   * transform entity
   * @param model
   * @param transformOptions
   */
  transform(model: T, transformOptions = {}): K {
    return plainToInstance(ModelSerializer, model, transformOptions) as K;
  }

  /**
   * transform array of entity
   * @param models
   * @param transformOptions
   */
  transformMany(models: T[], transformOptions = {}): K[] {
    return models.map((model) => this.transform(model, transformOptions));
  }
}
