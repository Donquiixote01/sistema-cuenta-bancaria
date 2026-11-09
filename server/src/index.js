import app from './app.js';
import { conectarDB } from './config/db.js';

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/banco_db';

try {
  await conectarDB(MONGODB_URI);
  app.listen(PORT, () => console.log(`🚀 API escuchando en http://localhost:${PORT}/api`));
} catch (err) {
  console.error('❌ No se pudo conectar a MongoDB. ¿Está corriendo el servicio mongod?');
  console.error(err.message);
  process.exit(1);
}
