import { Router } from 'express';
import * as ctrl from '../controllers/cuentaController.js';

const router = Router();

// Express 5 propaga automáticamente los errores de funciones async al errorHandler
router.get('/cuentas', ctrl.listarCuentas);

router.post('/cuenta/deposito', ctrl.depositar);
router.post('/cuenta/retiro', ctrl.retirar);
router.post('/cuenta/transferencia', ctrl.transferir);

router.get('/cuenta/:id', ctrl.obtenerCuenta);
router.get('/cuenta/:id/historial', ctrl.historial);

export default router;
