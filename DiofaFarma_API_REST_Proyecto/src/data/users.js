/**
 * Archivo de Datos en Memoria: Usuarios
 * Módulo: Data / Users
 * 
 * Contiene el arreglo de usuarios almacenados temporalmente en la memoria del proceso Node.js.
 * Nota: Los datos persisten únicamente mientras el servidor se encuentre en ejecución.
 * Al reiniciar el servidor, la colección vuelve a su estado inicial.
 * Esta capa simula la persistencia para permitir el desarrollo y desacoplamiento
 * antes de la integración con una base de datos real.
 */

const users = [
  {
    id: 1,
    usuario: "admin",
    password: "123456"
  }
];

module.exports = users;
