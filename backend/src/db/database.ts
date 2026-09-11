import type { QueryResult, QueryResultRow } from 'pg';

export interface Database {
  query<Row extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<QueryResult<Row>>;
  close(): Promise<void>;
}
