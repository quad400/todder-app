import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  Connection,
  Default__v,
  Document,
  FilterQuery,
  IfAny,
  Model,
  PopulateOptions,
  Require_id,
  UpdateQuery,
} from 'mongoose';
// import { AbstractSchema } from './abstract.schema';
import { v4 as uuidV4 } from 'uuid';

export abstract class AbstractRepository<TDocument extends Document> {
  private connection: Connection;

  constructor(protected readonly model: Model<TDocument>) {
    this.connection = new Connection();
  }

  // Unique check method
  async checkUnique(
    data: Record<string, any>,
    uniqueField: string,
  ): Promise<boolean> {
    const entity = await this.findOneNotNull({
      filterQuery: {
        [uniqueField]: data[uniqueField],
      } as any,
    });

    if (entity) {
      throw new ConflictException(
        `${this.model.collection.collectionName
          .toLocaleLowerCase()
          .slice(
            0,
            -1,
          )} with ${uniqueField} ${data[uniqueField]} already exists.`,
      );
    }
    return true;
  }

  async create(document: Record<string, any>): Promise<IfAny<TDocument, any>> {
    const createdDocument = new this.model({
      ...document,
      _id: uuidV4(),
    });
    return await createdDocument.save();
  }

  async findOne({
    filterQuery,
    populate,
  }: {
    filterQuery: FilterQuery<TDocument>;
    populate?: PopulateOptions | (string | PopulateOptions)[];
  }): Promise<TDocument> {
    let query = this.model.findOne({ ...filterQuery });

    if (populate) {
      query = query?.populate(populate);
    }

    if (!query) {
      throw new NotFoundException(
        `${this.model.collection.collectionName
          .toLowerCase()
          .slice(0, -1)} not found.`,
      );
    }

    const doc = (await query.exec()) as TDocument;
    return doc;
  }

  async findOneNotNull({
    filterQuery,
    populate,
  }: {
    filterQuery: FilterQuery<TDocument>;
    populate?: PopulateOptions | (string | PopulateOptions)[];
  }): Promise<TDocument> {
    let query = this.model.findOne({ ...filterQuery });

    if (populate) {
      query = query?.populate(populate);
    }

    const doc = (await query.exec()) as TDocument;
    return doc;
  }

  async findById(id: string): Promise<TDocument> {
    const document = (await this.model
      .findOne({ _id: id })
      .lean()) as TDocument;

    if (!document) {
      throw new NotFoundException(
        `${this.model.collection.collectionName
          .toLowerCase()
          .slice(0, -1)} not found.`,
      );
    }
    return document;
  }

  async findOneAndUpdates(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(
      { ...filterQuery },
      update,
      {
        new: true,
      },
    );

    if (!document) {
      throw new NotFoundException(
        `${this.model.collection.collectionName
          .toLowerCase()
          .slice(0, -1)} not found.`,
      );
    }

    return document;
  }

  async find({
    filterQuery,
    populate,
  }: {
    filterQuery?: FilterQuery<TDocument>;
    populate?: PopulateOptions | (string | PopulateOptions)[];
  }): Promise<TDocument[]> {
    let query = this.model.find({ ...filterQuery }).lean();

    if (populate) {
      query = query.populate(populate);
    }

    const items = (await query.exec()) as TDocument[];
    return items;
  }

  async findPaginate({
    options,
    search,
    populate,
    page = 1,
    limit = 10,
  }: {
    options: FilterQuery<TDocument>;
    page?: number;
    limit?: number;
    search?: string;
    populate?: PopulateOptions | (string | PopulateOptions)[];
  }): Promise<{
    data: TDocument[];
    total: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    const whereCondition = {
      ...(options as FilterQuery<TDocument>),
      ...(search
        ? { name: { $regex: search, $options: 'i' } } // Case-insensitive search for name
        : {}),
    } as FilterQuery<TDocument>;

    const total = await this.model.countDocuments(whereCondition);
    let data = this.model.find(whereCondition);
    if (populate) {
      data = data.populate(populate);
    }
    const query = (await data
      .lean()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec()) as TDocument[];

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      total,
      currentPage: page,
      hasNextPage,
      hasPreviousPage,
      data: query,
    };
  }

  async delete(filterQuery: FilterQuery<TDocument>) {
    const document = await this.model.findOneAndDelete(filterQuery);

    if (!document) {
      throw new NotFoundException(
        `${this.model.collection.collectionName
          .toLowerCase()
          .slice(0, -1)} not found.`,
      );
    }
  }

  async softDelete(filterQuery: FilterQuery<TDocument>) {
    const document = await this.model.findOneAndUpdate(
      filterQuery,
      { is_deleted: true },
      {
        new: true,
      },
    );

    if (!document) {
      throw new NotFoundException(
        `${this.model.collection.collectionName
          .toLowerCase()
          .slice(0, -1)} not found.`,
      );
    }

    return document;
  }

  async restore(filterQuery: FilterQuery<TDocument>) {
    const document = await this.model.findOneAndUpdate(
      { ...filterQuery, is_deleted: true },
      { is_deleted: false },
      {
        new: true,
      },
    );

    if (!document) {
      throw new NotFoundException(
        `${this.model.collection.collectionName
          .toLowerCase()
          .slice(0, -1)} not found.`,
      );
    }

    return document;
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
