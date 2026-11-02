import { Model, PipelineStage } from 'mongoose';
import QueryBuilder from './QueryBuilder';

type AggregateQuery = {
  _fields?: Record<string, number>;
  _applyPaths?: () => void;
  _fieldsForExec?: () => Record<string, number> | null;
  cast: (model: Model<any>) => Record<string, unknown>;
  model: Model<any>;
  getOptions: () => {
    sort?: Record<string, 1 | -1>;
    skip?: number;
    limit?: number;
  };
};

const preparedQuery = (qb: QueryBuilder<any>) => {
  const query = qb.modelQuery as unknown as AggregateQuery;
  if (query._fields && Object.keys(query._fields).length && query._applyPaths) {
    query._applyPaths();
  }

  const options = query.getOptions();
  return {
    filter: query.cast(query.model),
    sort:
      options.sort && Object.keys(options.sort).length
        ? options.sort
        : { createdAt: -1 as const },
    skip: options.skip || 0,
    limit: options.limit || 10,
    projection: query._fieldsForExec?.() ?? null,
  };
};

const withKeptFields = (
  projection: Record<string, number> | null,
  keepFields: string[],
) => {
  if (!projection || keepFields.length === 0) {
    return projection;
  }

  const inclusion = Object.entries(projection).some(
    ([key, value]) => key !== '_id' && value === 1,
  );
  if (!inclusion) {
    return projection;
  }

  const next = { ...projection };
  keepFields.forEach(field => {
    next[field] = 1;
  });
  return next;
};

export const paginationFrom = (
  query: Record<string, unknown>,
  total: number,
) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;

  return {
    total,
    limit,
    page,
    totalPage: Math.ceil(total / limit),
  };
};

export const aggregatePage = async (
  model: Model<any>,
  qb: QueryBuilder<any>,
  dataStages: PipelineStage[] = [],
  keepFields: string[] = [],
) => {
  const { filter, sort, skip, limit, projection } = preparedQuery(qb);
  const pageStages: PipelineStage[] = [
    { $skip: skip },
    { $limit: limit },
    ...dataStages,
  ];
  const finalProjection = withKeptFields(projection, keepFields);
  if (finalProjection) {
    pageStages.push({ $project: finalProjection });
  }

  const [result] = await model.aggregate([
    { $match: filter },
    { $sort: sort },
    {
      $facet: {
        meta: [{ $count: 'total' }],
        data: pageStages,
      },
    },
  ] as PipelineStage[]);

  return {
    data: (result?.data ?? []) as any[],
    pagination: paginationFrom(qb.query, result?.meta?.[0]?.total || 0),
  };
};

export const aggregateById = async (
  model: Model<any>,
  id: string,
  dataStages: PipelineStage[] = [],
) => {
  const filter = (model.findById(id) as unknown as AggregateQuery).cast(model);
  const [doc] = await model.aggregate([
    { $match: filter },
    ...dataStages,
  ] as PipelineStage[]);

  return doc ?? null;
};

export const attachCount = (
  from: string,
  foreignField: string,
  countField: string,
): PipelineStage[] => {
  const bucket = `${countField}Bucket`;

  return [
    {
      $lookup: {
        from,
        let: { localId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: [`$${foreignField}`, '$$localId'] },
            },
          },
          { $count: 'count' },
        ],
        as: bucket,
      },
    },
    {
      $addFields: {
        [countField]: {
          $ifNull: [{ $arrayElemAt: [`$${bucket}.count`, 0] }, 0],
        },
      },
    },
    { $unset: bucket },
  ];
};

export const attachRef = (
  from: string,
  field: string,
  select: string,
): PipelineStage[] => {
  const project: Record<string, 1> = {};
  select.split(' ').filter(Boolean).forEach(key => {
    project[key] = 1;
  });
  const bucket = `${field}Lookup`;

  return [
    {
      $lookup: {
        from,
        let: { refId: `$${field}` },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$refId'] } } },
          { $limit: 1 },
          { $project: project },
        ],
        as: bucket,
      },
    },
    {
      $addFields: {
        [field]: {
          $cond: [
            { $gt: [{ $size: `$${bucket}` }, 0] },
            { $arrayElemAt: [`$${bucket}`, 0] },
            {
              $cond: [
                { $eq: [{ $type: `$${field}` }, 'objectId'] },
                null,
                {
                  $cond: [
                    { $eq: [{ $type: `$${field}` }, 'missing'] },
                    '$$REMOVE',
                    `$${field}`,
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    { $unset: bucket },
  ];
};
