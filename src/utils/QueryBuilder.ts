import { IQueryParams, IPaginationMeta, IQueryResult } from "./queryBuilder.interface";
import { PAGINATION } from "./constants";

export { IQueryParams, IPaginationMeta, IQueryResult };

export class QueryBuilder<T = any> {
  public model: any;
  public query: IQueryParams;
  public where: Record<string, any> = {};
  public orderBy: Record<string, "asc" | "desc"> = {};
  public skip: number = 0;
  public take: number = PAGINATION.DEFAULT_LIMIT;
  public page: number = PAGINATION.DEFAULT_PAGE;
  public limit: number = PAGINATION.DEFAULT_LIMIT;
  public select?: Record<string, boolean>;
  public include?: Record<string, any>;

  constructor(model: any, query: IQueryParams = {}) {
    this.model = model;
    this.query = query;
    this.page = Math.max(1, Number(query.page) || PAGINATION.DEFAULT_PAGE);
    this.limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, Number(query.limit) || PAGINATION.DEFAULT_LIMIT)
    );
    this.skip = (this.page - 1) * this.limit;
    this.take = this.limit;
  }

  // 1. Search
  search(searchableFields: string[]) {
    const searchTerm = (this.query.searchTerm || this.query.search)?.toString().trim();
    if (searchTerm && searchableFields.length > 0) {
      this.where.OR = searchableFields.map((field) => {
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          return {
            [parent]: {
              [child]: { contains: searchTerm, mode: "insensitive" },
            },
          };
        }
        return {
          [field]: { contains: searchTerm, mode: "insensitive" },
        };
      });
    }
    return this;
  }

  // 2. Filtering
  filter(excludeFields: string[] = ["search", "searchTerm", "sortBy", "sortOrder", "sort", "page", "limit", "fields"]) {
    const queryObj = { ...this.query };
    excludeFields.forEach((field) => delete queryObj[field]);

    for (const [key, value] of Object.entries(queryObj)) {
      if (value !== undefined && value !== "" && value !== null) {
        if (value === "true") {
          this.where[key] = true;
        } else if (value === "false") {
          this.where[key] = false;
        } else {
          this.where[key] = value;
        }
      }
    }
    return this;
  }

  // 3. Sorting
  sort(defaultSortBy = "createdAt", defaultOrder: "asc" | "desc" = "desc") {
    let sortBy = defaultSortBy;
    let sortOrder = defaultOrder;

    if (this.query.sort) {
      const sortStr = this.query.sort.toString().trim();
      if (sortStr.startsWith("-")) {
        sortBy = sortStr.substring(1);
        sortOrder = "desc";
      } else {
        sortBy = sortStr;
        sortOrder = "asc";
      }
    } else {
      if (this.query.sortBy) {
        sortBy = this.query.sortBy.toString();
      }
      if (this.query.sortOrder) {
        sortOrder = this.query.sortOrder.toString().toLowerCase() === "asc" ? "asc" : "desc";
      }
    }

    this.orderBy = { [sortBy]: sortOrder };
    return this;
  }

  // 4. Pagination
  paginate() {
    this.page = Math.max(1, Number(this.query.page) || PAGINATION.DEFAULT_PAGE);
    this.limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, Number(this.query.limit) || PAGINATION.DEFAULT_LIMIT)
    );
    this.skip = (this.page - 1) * this.limit;
    this.take = this.limit;
    return this;
  }

  // 5. Fields Selection
  fields() {
    if (this.query.fields) {
      const fieldList = (this.query.fields as string).split(",").map((f) => f.trim());
      const selectObj: Record<string, boolean> = {};
      fieldList.forEach((field) => {
        if (field) selectObj[field] = true;
      });
      if (Object.keys(selectObj).length > 0) {
        this.select = selectObj;
      }
    }
    return this;
  }

  // Count total records
  async countTotal(): Promise<number> {
    return this.model.count({ where: this.where });
  }

  // Execute query and return data with meta
  async execute(): Promise<IQueryResult<T>> {
    const findOptions: any = {
      where: this.where,
      orderBy: this.orderBy,
      skip: this.skip,
      take: this.take,
    };

    if (this.select) {
      findOptions.select = this.select;
    } else if (this.include) {
      findOptions.include = this.include;
    }

    const [total, data] = await Promise.all([
      this.model.count({ where: this.where }),
      this.model.findMany(findOptions),
    ]);

    const totalPages = Math.ceil(total / this.limit) || 1;

    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages,
      },
    };
  }
}

export default QueryBuilder;
