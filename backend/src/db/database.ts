import type { QueryResult, QueryResultRow } from 'pg';

export interface Database {
  query<Row extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<QueryResult<Row>>;
  transaction<T>(work: (database: TransactionDatabase) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export type TransactionDatabase = Pick<Database, 'query'>;
