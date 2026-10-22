/**
 * Script de Verificación y Pruebas Automatizadas para DioFaFarma API
 * Módulo: Test / Test-API
 * 
 * Ejecuta una batería exhaustiva de pruebas sobre todos los endpoints de la API,
 * validando códigos de respuesta HTTP, estructuras de respuesta JSON y escenarios de error.
 */

const http = require("http");
const app = require("../src/app");

const PORT = 3001; // Usamos el puerto 3001 para la ejecución de pruebas sin interferir

let server;
let baseUrl;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const status = response.status;
  let body;
  try {
    body = await response.json();
  } catch (err) {
    body = null;
  }

  return { status, body };
}

async function runTests() {
  console.log("\n==================================================");
  console.log(" INICIANDO BATERÍA DE PRUEBAS DE DIOFAFARMA API");
  console.log("==================================================\n");

  // 1. HEALTH CHECK
  console.log("--- 1. Pruebas de Health Check ---");
  {
    const res = await request("/api/health");
    assert(res.status === 200, "GET /api/health retorna código 200");
    assert(res.body.success === true, "GET /api/health success es true");
    assert(
      res.body.message === "API DioFaFarma funcionando correctamente",
      "GET /api/health mensaje coincide exactamente"
    );
  }

  // 2. AUTENTICACIÓN - REGISTRO
  console.log("\n--- 2. Pruebas de Autenticación: Registro ---");
  {
    // Datos incompletos
    const resIncompleto = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ usuario: "" })
    });
    assert(resIncompleto.status === 400, "Registro sin password retorna 400");
    assert(
      resIncompleto.body.message === "El usuario y la contraseña son obligatorios",
      "Mensaje de validación de campos obligatorios"
    );

    // Registro exitoso
    const resExitoso = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ usuario: "cajero1", password: "mypassword" })
    });
    assert(resExitoso.status === 201, "Registro exitoso retorna 201");
    assert(
      resExitoso.body.message === "Usuario registrado correctamente",
      "Mensaje de registro exitoso"
    );
    assert(resExitoso.body.password === undefined, "No se expone la contraseña en la respuesta");

    // Usuario duplicado
    const resDuplicado = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ usuario: "cajero1", password: "otra" })
    });
    assert(resDuplicado.status === 409, "Registro con usuario duplicado retorna 409");
    assert(
      resDuplicado.body.message === "El usuario ya existe",
      "Mensaje de usuario duplicado"
    );
  }

  // 3. AUTENTICACIÓN - LOGIN
  console.log("\n--- 3. Pruebas de Autenticación: Login ---");
  {
    // Login incompleto
    const resIncompleto = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario: "admin" })
    });
    assert(resIncompleto.status === 400, "Login sin password retorna 400");

    // Login credenciales incorrectas
    const resFallido = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario: "admin", password: "password_incorrecto" })
    });
    assert(resFallido.status === 401, "Login incorrecto retorna 401");
    assert(
      resFallido.body.message === "Error en la autenticación",
      "Mensaje de error en la autenticación"
    );

    // Login exitoso con usuario registrado previamente
    const resExitoso = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario: "cajero1", password: "mypassword" })
    });
    assert(resExitoso.status === 200, "Login exitoso retorna 200");
    assert(
      resExitoso.body.message === "Autenticación satisfactoria",
      "Mensaje de autenticación satisfactoria"
    );
    assert(resExitoso.body.data.usuario === "cajero1", "Retorna usuario en data");
    assert(resExitoso.body.data.password === undefined, "No retorna contraseña en data");

    // Login exitoso con usuario inicial por defecto (admin / 123456)
    const resAdmin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario: "admin", password: "123456" })
    });
    assert(resAdmin.status === 200, "Login admin inicial retorna 200");
    assert(resAdmin.body.data.usuario === "admin", "Usuario admin autenticado");
  }

  // 4. CRUD PRODUCTOS - LISTAR
  console.log("\n--- 4. Pruebas de Productos: Listar ---");
  {
    const res = await request("/api/productos");
    assert(res.status === 200, "GET /api/productos retorna 200");
    assert(Array.isArray(res.body.data), "data es un arreglo de productos");
    assert(res.body.data.length >= 2, "Contiene al menos los productos iniciales");
    assert(
      res.body.data[0].codigo === "MED001",
      "El primer producto tiene código MED001"
    );
  }

  // 5. CRUD PRODUCTOS - OBTENER POR ID
  console.log("\n--- 5. Pruebas de Productos: Obtener por ID ---");
  {
    // Producto existente
    const res = await request("/api/productos/1");
    assert(res.status === 200, "GET /api/productos/1 retorna 200");
    assert(res.body.data.id === 1, "ID del producto es 1");
    assert(res.body.data.nombre === "Acetaminofén 500mg", "Nombre coincide");

    // Producto inexistente
    const resNoExiste = await request("/api/productos/9999");
    assert(resNoExiste.status === 404, "GET /api/productos/9999 retorna 404");
    assert(
      resNoExiste.body.message === "Producto no encontrado",
      "Mensaje de producto no encontrado"
    );

    // ID inválido
    const resInvalido = await request("/api/productos/invalido");
    assert(resInvalido.status === 400, "GET /api/productos/invalido retorna 400");
  }

  // 6. CRUD PRODUCTOS - CREAR
  console.log("\n--- 6. Pruebas de Productos: Crear ---");
  let idProductoCreado = null;
  {
    // Validación: campos vacíos
    const resVacio = await request("/api/productos", {
      method: "POST",
      body: JSON.stringify({})
    });
    assert(resVacio.status === 400, "Crear sin datos retorna 400");

    // Validación: stock negativo
    const resStockNegativo = await request("/api/productos", {
      method: "POST",
      body: JSON.stringify({
        codigo: "MED099",
        nombre: "Jarabe",
        precioCompra: 1000,
        precioVenta: 1500,
        stock: -5,
        estado: true
      })
    });
    assert(resStockNegativo.status === 400, "Crear con stock negativo retorna 400");

    // Validación: código duplicado
    const resCodigoDuplicado = await request("/api/productos", {
      method: "POST",
      body: JSON.stringify({
        codigo: "MED001", // Ya existe
        nombre: "Otro producto",
        precioCompra: 1000,
        precioVenta: 1500,
        stock: 10,
        estado: true
      })
    });
    assert(resCodigoDuplicado.status === 409, "Crear con código existente retorna 409");
    assert(
      resCodigoDuplicado.body.message === "El código del producto ya existe",
      "Mensaje código duplicado correcto"
    );

    // Creación exitosa
    const nuevoProductoData = {
      codigo: "MED003",
      nombre: "Loratadina",
      descripcion: "Antialérgico",
      laboratorio: "Laboratorio Demo",
      precioCompra: 3000,
      precioVenta: 5000,
      stock: 20,
      estado: true
    };
    const resExitoso = await request("/api/productos", {
      method: "POST",
      body: JSON.stringify(nuevoProductoData)
    });
    assert(resExitoso.status === 201, "Crear producto válido retorna 201");
    assert(resExitoso.body.data.id !== undefined, "ID generado automáticamente");
    assert(resExitoso.body.data.codigo === "MED003", "Código coincide");
    assert(resExitoso.body.data.precioCompra === 3000, "precioCompra con nombre exacto");
    assert(resExitoso.body.data.precioVenta === 5000, "precioVenta con nombre exacto");
    idProductoCreado = resExitoso.body.data.id;
  }

  // 7. CRUD PRODUCTOS - ACTUALIZAR
  console.log("\n--- 7. Pruebas de Productos: Actualizar ---");
  {
    // Actualización de producto inexistente
    const resNoExiste = await request("/api/productos/9999", {
      method: "PUT",
      body: JSON.stringify({
        codigo: "MED999",
        nombre: "Test",
        precioCompra: 100,
        precioVenta: 200,
        stock: 5,
        estado: true
      })
    });
    assert(resNoExiste.status === 404, "Actualizar ID inexistente retorna 404");

    // Actualización con conflicto de código con otro producto
    const resConflicto = await request(`/api/productos/${idProductoCreado}`, {
      method: "PUT",
      body: JSON.stringify({
        codigo: "MED001", // Pertenece al producto 1
        nombre: "Loratadina Plus",
        precioCompra: 3200,
        precioVenta: 5200,
        stock: 25,
        estado: true
      })
    });
    assert(resConflicto.status === 409, "Actualizar a un código ya usado por otro producto retorna 409");

    // Actualización exitosa
    const resExitoso = await request(`/api/productos/${idProductoCreado}`, {
      method: "PUT",
      body: JSON.stringify({
        codigo: "MED003",
        nombre: "Loratadina 10mg",
        descripcion: "Antialérgico potente",
        laboratorio: "Laboratorio Farmacéutico",
        precioCompra: 3200,
        precioVenta: 5500,
        stock: 45,
        estado: true
      })
    });
    assert(resExitoso.status === 200, "Actualizar producto retorna 200");
    assert(resExitoso.body.data.nombre === "Loratadina 10mg", "Nombre fue actualizado");
    assert(resExitoso.body.data.precioVenta === 5500, "precioVenta fue actualizado");
  }

  // 8. CRUD PRODUCTOS - ELIMINAR
  console.log("\n--- 8. Pruebas de Productos: Eliminar ---");
  {
    // Eliminar producto existente
    const resEliminar = await request(`/api/productos/${idProductoCreado}`, {
      method: "DELETE"
    });
    assert(resEliminar.status === 200, "DELETE producto retorna 200");
    assert(
      resEliminar.body.message === "Producto eliminado correctamente",
      "Mensaje de producto eliminado correctamente"
    );

    // Verificar que ya no existe
    const resVerificar = await request(`/api/productos/${idProductoCreado}`);
    assert(resVerificar.status === 404, "Producto eliminado ya no es encontrado (404)");

    // Eliminar inexistente
    const resNoExiste = await request("/api/productos/9999", {
      method: "DELETE"
    });
    assert(resNoExiste.status === 404, "DELETE producto inexistente retorna 404");
  }

  // 9. RUTA NO ENCONTRADA (404)
  console.log("\n--- 9. Pruebas de Rutas no encontradas ---");
  {
    const res404 = await request("/api/inexistente");
    assert(res404.status === 404, "Ruta desconocida retorna 404");
    assert(res404.body.success === false, "success es false en 404");
  }

  console.log("\n==================================================");
  console.log(` RESULTADOS: ${passedTests}/${totalTests} pruebas pasadas`);
  if (failedTests > 0) {
    console.error(` ✗ Fallaron ${failedTests} pruebas.`);
  } else {
    console.log(" ✓ ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!");
  }
  console.log("==================================================\n");

  server.close(() => {
    process.exit(failedTests > 0 ? 1 : 0);
  });
}

// Iniciar servidor de prueba y ejecutar tests
server = app.listen(PORT, () => {
  baseUrl = `http://localhost:${PORT}`;
  runTests().catch((err) => {
    console.error("Error al ejecutar las pruebas:", err);
    server.close(() => process.exit(1));
  });
});
