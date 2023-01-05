/* eslint-disable no-param-reassign */
import { Schema, Document } from 'mongoose';

interface Pagination {
  page: number;
  limit: number;
}

export interface QueryResult {
  results: Document[];
  currentPage: number;
  limit: number;
  totalPages: number;
  countOfFilteredDocuments: number;
  next?: Pagination | undefined;
  prev?: Pagination | undefined;
}

export interface IOptions {
  sortBy?: string;
  selectedFieldsToIncludeOrHide?: string;
  populate?: string;
  limit?: number;
  page?: number;
}

const paginate = (schema: Schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} currentPage - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} countOfFilteredDocuments - Total number of documents
   * @property {Object} next - Pagination object for the next page
   * @property {Object} prev - Pagination object for the previous page
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,) e.g. createdAt:desc,name:asc
   * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,) e.g. user,posts.author
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @param {string} [options.selectedFieldsToIncludeOrHide] - Fields to hide or include (default = '') e.g. password:hide,email:include,name:include,createdAt:include
   * @returns {Promise<QueryResult>}
   */
  schema.static('paginate', async function (filter: Record<string, any>, options: IOptions): Promise<QueryResult> {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria: any = [];
      options.sortBy.split(',').forEach((sortOption: string) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = 'createdAt';
    }

    let select = '';
    if (options.selectedFieldsToIncludeOrHide) {
      const selectionCriteria: string[] = [];
      options.selectedFieldsToIncludeOrHide.split(',').forEach((projectOption: string) => {
        const [key, include] = projectOption.split(':');
        selectionCriteria.push((include === 'hide' ? '-' : '') + key);
      });
      select = selectionCriteria.join(' ');
    } else {
      select = '-password -createdAt -updatedAt';
    }

    const limit = options.limit && parseInt(options.limit.toString(), 10) > 0 ? parseInt(options.limit.toString(), 10) : 10; // Default limit = 10
    const page = options.page && parseInt(options.page.toString(), 10) > 0 ? parseInt(options.page.toString(), 10) : 1; // Default page number = 1
    const skip = (page - 1) * limit; // For page 1, the skip is: (1 - 1) * 20 => 0 * 20 = 0
    const startIndex = skip;
    const endIndex = page * limit;

    const countPromise = this.countDocuments(filter).exec();
    // OR const count = await this.countDocuments(filter);
    let documentsPromise = this.find(filter).sort(sort).skip(skip).limit(limit).select(select);

    if (options.populate) {
      options.populate.split(',').forEach((populateOption: any) => {
        documentsPromise = documentsPromise.populate(
          populateOption
            .split('.')
            .reverse()
            .reduce((a: string, b: string) => ({ path: b, populate: a })),
        );
      });
    }

    // Execute when the logic is done for populating
    documentsPromise = documentsPromise.exec();

    return Promise.all([countPromise, documentsPromise])
      .then(values => {
        const [countOfFilteredDocuments, results] = values;
        const totalPages = Math.ceil(countOfFilteredDocuments / limit);
        const currentPage = page;
        let next: Pagination | undefined;
        let prev: Pagination | undefined;

        if (endIndex < countOfFilteredDocuments) {
          next = {
            page: page + 1,
            limit,
          };
        }
        if (startIndex > 0 && page <= totalPages) {
          prev = {
            page: page - 1,
            limit,
          };
        }

        const result = {
          results,
          currentPage,
          limit,
          totalPages,
          countOfFilteredDocuments,
          next,
          prev,
        };
        return Promise.resolve(result);
      })
      .catch(err => Promise.reject(err));
  });
};

// USAGE
// myModel.paginate(filterObject, queryOptions).then(({ results, currentPage, limit, totalPages, countOfFilteredDocuments, next, prev }) => {}).catch(error => logger.error(error.message)); // Usage

export default paginate;
