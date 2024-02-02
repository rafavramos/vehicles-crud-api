import { Pool } from 'pg';

const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'senha',
    port: 5432, 
});

export default db;