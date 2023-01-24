import { PrismaClient } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { NotFoundException } from 'src/exception/not-found.exception';
import { Pagination } from 'src/modules/paginate';

import QueryBuilder from './filter-prisma';
import {
  ClassConstructor,
  CreateInterface,
  FindAllInterface,
  FindByIdInterface,
  FindByInterface,
  FindPaginateInterface,
  Repository,
  UpdateInterface,
} from './type.repository';

export abstract class BaseRepository<Entity> implements Repository<Entity> {
  private readonly ORM: PrismaClient;
  private readonly table_name: string;

  protected constructor(tablename: string, ORM: PrismaClient) {
    this.ORM = ORM;
    this.table_name = tablename;
  }

  /**
   * save the entity on database
   *
   * @param {CreateInterface<Entity>} options
   * @return {*}  {(Promise<Entity | null>)}
   * @memberof BaseRepository
   */
  async create(options: CreateInterface<Entity>): Promise<Entity | null> {
    const data = await this.ORM[this.table_name.toString()].create({
      data: options.data,
    });

    if (!data) {
      return null;
    }

    if (options.cls) {
      return await this.transform(data, options.cls, options.transformOptions);
    }
  }

  /**
   * deletes the entity from the database
   *
   * @param {string} id
   * @return {*}  {Promise<void>}
   * @memberof BaseRepository
   */
  delete(id: string): Promise<void> {
    return this.ORM[this.table_name.toString()].delete({
      where: {
        id: id,
      },
    });
  }

  /**
   * update the entity on database
   *
   * @param {UpdateInterface<Entity>} options
   * @return {*}  {(Promise<Entity | null>)}
   * @memberof BaseRepository
   */
  async update(options: UpdateInterface<Entity>): Promise<Entity | null> {
    const data = await this.ORM[this.table_name.toString()].update({
      where: {
        id: options.id,
      },
      data: options.data,
    });

    if (!data) {
      return null;
    }

    if (options.cls) {
      return await this.transform(data, options.cls, options.transformOptions);
    }
  }

  /**
   * find all with conditions
   *
   * @param {FindAllInterface<Entity>} [findOptions]
   * @return {*}  {Promise<Entity[]>}
   * @memberof BaseRepository
   */
  async findAll(findOptions?: FindAllInterface<Entity>): Promise<Entity[]> {
    try {
      const results = await this.ORM[this.table_name.toString()].findMany({
        ...findOptions.searchFilter,
        include: findOptions.include,
      });

      if (findOptions.cls) {
        return await this.transformMany(
          results,
          findOptions.cls,
          findOptions.transformOptions,
        );
      } else {
        return results;
      }
    } catch (error) {
      return [];
    }
  }

  /**
   * find and count entity
   *
   * @param {FindAllInterface<Entity>} [findOptions]
   * @return {*}  {Promise<[Entity[], number]>}
   * @memberof BaseRepository
   */
  async findAndCount(
    findOptions?: FindAllInterface<Entity>,
  ): Promise<[Entity[], number]> {
    try {
      const results = await this.ORM[this.table_name.toString()].findMany({
        ...findOptions.searchFilter,
        include: findOptions.include,
      });

      const all = await this.ORM[this.table_name.toString()].count();

      if (findOptions.cls) {
        const traformededEntity = await this.transformMany(
          results,
          findOptions.cls,
          findOptions.transformOptions,
        );

        return [traformededEntity, all];
      } else {
        return [results, all];
      }
    } catch (error) {
      return [null, 0];
    }
  }

  /**
   * find entity by id
   *
   * @param {FindByIdInterface<Entity>} findOptions
   * @return {*}  {(Promise<Entity | null>)}
   * @memberof BaseRepository
   */
  findOne(findOptions: FindByIdInterface<Entity>): Promise<Entity | null> {
    return this.ORM[this.table_name.toString()]
      .findFirst({
        where: {
          id: findOptions.id,
        },
        include: findOptions.include,
      })
      .then((entity) => {
        if (!entity) {
          return Promise.reject(new NotFoundException());
        }

        if (findOptions.cls) {
          return Promise.resolve(
            entity
              ? this.transform(
                  entity,
                  findOptions.cls,
                  findOptions.transformOptions,
                )
              : null,
          );
        } else {
          return Promise.resolve(entity ? entity : null);
        }
      })
      .catch((error) => Promise.reject(error));
  }

  /**
   * find by condition
   *
   * @param {string} fieldName
   * @param {*} value
   * @param {*} [include]
   * @return {*}  {(Promise<Entity | null>)}
   * @memberof BaseRepository
   */
  async findBy(findOptions: FindByInterface<Entity>): Promise<Entity | null> {
    return this.ORM[this.table_name.toString()]
      .findFirst({
        where: {
          [findOptions.fieldName]: findOptions.value,
        },
        include: findOptions.include,
      })
      .then((entity) => {
        if (!entity) {
          return null; //Promise.reject(new NotFoundException()); see if can use this instead
        }

        if (findOptions.cls) {
          return Promise.resolve(
            entity
              ? this.transform(
                  entity,
                  findOptions.cls,
                  findOptions.transformOptions,
                )
              : null,
          );
        } else {
          return Promise.resolve(entity ? entity : null);
        }
      })
      .catch((error) => Promise.reject(error));
  }

  /**
   * get count of entity by condition
   *
   * @param {*} [findOptions={}]
   * @return {*}  {Promise<number>}
   * @memberof BaseRepository
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

  /**
   * Paginate entity results
   *
   * @param {FindPaginateInterface<Entity>} paginateData
   * @return {*}  {Promise<Pagination<Entity>>}
   * @memberof BaseRepository
   */
  async paginate(
    paginateData: FindPaginateInterface<Entity>,
  ): Promise<Pagination<Entity>> {
    const qb = new QueryBuilder({
      page: paginateData.searchFilter.page,
      perPage: paginateData.searchFilter.perPage,
    });
    const filterOptions = qb.paginate().build();

    const [results, total] = await this.findAndCount({
      searchFilter: filterOptions,
      include: paginateData.include,
      cls: paginateData.cls,
      transformOptions: paginateData.transformOptions,
    });

    const currentPage = Number(paginateData.searchFilter?.page) || 1;
    const perPage = Number(paginateData.searchFilter.perPage) || 10;
    // const skip = currentPage > 0 ? perPage * (currentPage - 1) : 0;
    const lastPage = Math.ceil(total / perPage);

    return new Pagination<Entity>({
      results: results,
      meta: {
        total,
        lastPage,
        currentPage,
        perPage,
        previous: currentPage > 1 ? currentPage - 1 : null,
        next: currentPage < lastPage ? currentPage + 1 : null,
      },
    });
  }

  /**
   * Transform entity
   *
   * @param {*} model
   * @param {ClassConstructor<Entity>} cls
   * @param {*} [transformOptions={}]
   * @return {*}  {Entity}
   * @memberof BaseRepository
   */
  transform(
    model: any,
    cls: ClassConstructor<Entity>,
    transformOptions = {},
  ): Entity {
    return plainToInstance(cls, model, transformOptions) as Entity;
  }

  /**
   *  transform array of entity
   *
   * @param {any[]} models
   * @param {ClassConstructor<Entity>} cls
   * @param {*} [transformOptions={}]
   * @return {*}  {Entity[]}
   * @memberof BaseRepository
   */
  transformMany(
    models: any[],
    cls: ClassConstructor<Entity>,
    transformOptions = {},
  ): Entity[] {
    return models.map((model) => this.transform(model, cls, transformOptions));
  }
}
