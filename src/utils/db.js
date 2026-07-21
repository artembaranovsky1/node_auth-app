import 'dotenv/config';
import { Sequelize } from 'sequelize';

export const client = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
});

await client.authenticate();

// const [version] = await client.query(`
//   SELECT current_database(), inet_server_addr(), inet_server_port();
// `);
//
// console.log(version);
//
// const [result] = await client.query('SELECT current_database()');
//
// console.log(result);
