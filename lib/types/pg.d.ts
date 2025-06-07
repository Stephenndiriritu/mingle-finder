declare module 'pg' {
  export interface PoolConfig {
    connectionString?: string;
    ssl?: boolean | { rejectUnauthorized: boolean };
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
    statement_timeout?: number;
    query_timeout?: number;
    application_name?: string;
    keepAlive?: boolean;
    keepAliveInitialDelayMillis?: number;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    on(event: string, listener: Function): void;
    end(): Promise<void>;
    connect(): Promise<PoolClient>;
    query(text: string, params?: any[]): Promise<QueryResult>;
  }

  export interface PoolClient {
    query(text: string, params?: any[]): Promise<QueryResult>;
    release(): void;
  }

  export interface QueryResult {
    rows: any[];
    rowCount: number;
  }
} 