import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import process from 'process';
import config from '../config/config.js'; // Updated import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env]; // Use config from the imported module
const db = {};

// Initialize Sequelize using dbConfig
const sequelize = dbConfig.use_env_variable
  ? new Sequelize(process.env[dbConfig.use_env_variable], dbConfig)
  : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

// Dynamically load model files
const modelFiles = fs.readdirSync(__dirname)
  .filter((file) => (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  ));

for (const file of modelFiles) {
  console.log(`Loading model file: ${file}`);
  // Use top-level await or adjust as needed (see previous instructions)
  const module = await import(path.join(__dirname, file));
  const model = module.default(sequelize, Sequelize.DataTypes);
  if (!model.name) {
    console.error(`Error: Model in file "${file}" does not have a name.`);
  }
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
