import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  //searching
  search(searchableFields: string[]) {
    if (this?.query?.searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          field =>
            ({
              [field]: {
                $regex: this.query.searchTerm,
                $options: 'i',
              },
            } as FilterQuery<T>)
        ),
      });
    }
    return this;
  }

  //filtering
  filter(fields?: string[]) {
    const queryObj = { ...this.query };
    // Ensure fields is always an array, defaulting to []
    const excludeFields = [
      ...(fields ?? []),
      'searchTerm',
      'sort',
      'page',
      'limit',
      'fields',
      'km',
      'lat',
      'lng'
    ];
    excludeFields.forEach(el => delete queryObj[el]);
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  //sorting
  sort() {
    let sort = (this?.query?.sort as string) || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }

  //pagination
  paginate() {
    let limit = Number(this?.query?.limit) || 10;
    let page = Number(this?.query?.page) || 1;
    let skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  //fields filtering
  fields() {
    let fields =
      (this?.query?.fields as string)?.split(',').join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }

  //populating
  populate(populateFields: string[], selectFields: Record<string, unknown>) {
    this.modelQuery = this.modelQuery.populate(
      populateFields.map(field => ({
        path: field,
        select: selectFields[field],
      }))
    );
    return this;
  }

  //pagination information
  async getPaginationInfo() {
    const total = await this.modelQuery.model.countDocuments(
      this.modelQuery.getFilter()
    );
    const limit = Number(this?.query?.limit) || 10;
    const page = Number(this?.query?.page) || 1;
    const totalPage = Math.ceil(total / limit);

    return {
      total,
      limit,
      page,
      totalPage,
    };
  }
}

export default QueryBuilder;
