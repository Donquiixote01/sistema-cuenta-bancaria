/** Error de negocio con código HTTP asociado (400, 404, ...). */
export default class AppError extends Error {
  constructor(mensaje, status = 400) {
    super(mensaje);
    this.status = status;
  }
}
