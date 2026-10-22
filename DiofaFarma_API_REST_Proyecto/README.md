# DioFaFarma API REST

API REST modular y desacoplada desarrollada para el sistema de gestión de farmacia **DioFaFarma**. Construida con **Node.js** y **Express**, diseñada para servir como backend independiente y comunicarse con interfaces frontend desarrolladas en **React**.

> [!WARNING]
> **Almacenamiento Temporal en Memoria**: Actualmente, todos los datos (usuarios y productos) residen temporalmente en la memoria RAM del servidor. Al reiniciar o detener el proceso Node.js, las modificaciones se restaurarán a los datos iniciales de prueba. La arquitectura multicapa está preparada para desacoplar esta capa e integrar un motor de base de datos relacional o NoSQL en fases futuras sin modificar controladores ni rutas.

---

## 1. Objetivo del Proyecto

Proveer una interfaz de servicios HTTP/JSON robusta, estandarizada y segura para:
- **Autenticación**: Registro y validación de credenciales de usuarios.
- **Inventario / Productos**: Operaciones completas de creación, lectura, actualización y eliminación (CRUD) de medicamentos y productos farmacéuticos.
- **Health Check**: Monitoreo rápido del estado del servicio.

---

## 2. Tecnologías Utilizadas

- **Entorno de ejecución**: [Node.js](https://nodejs.org/) (v18+)
- **Framework web**: [Express.js](https://expressjs.com/) (v4.x)
- **Manejo de CORS**: [cors](https://www.npmjs.com/package/cors)
- **Protocolo de comunicación**: REST / HTTP / JSON
- **Gestor de paquetes**: npm

---

## 3. Estructura del Proyecto

El código está estructurado siguiendo principios de arquitectura limpia y separación de responsabilidades:

```text
diofafarma-api/
│
├── src/
│   ├── controllers/            # Controladores HTTP (manejo de req, res y códigos de estado)
│   │   ├── authController.js
│   │   └── productoController.js
│   │
│   ├── routes/                 # Definición de rutas y mapeo hacia controladores
│   │   ├── authRoutes.js
│   │   └── productoRoutes.js
│   │
│   ├── services/               # Lógica de negocio y validaciones
│   │   ├── authService.js
│   │   └── productoService.js
│   │
│   ├── data/                   # Colecciones de datos en memoria (persistencia temporal)
│   │   ├── users.js
│   │   └── productos.js
│   │
│   ├── middleware/             # Middlewares globales (captura centralizada de errores)
│   │   └── errorMiddleware.js
│   │
│   ├── app.js                  # Configuración de Express, CORS y middlewares
│   └── server.js               # Inicialización y arranque del servidor HTTP
│
├── test/
│   └── test-api.js             # Batería automatizada de pruebas para todos los endpoints
│
├── package.json                # Dependencias y scripts de ejecución
├── .gitignore                  # Exclusión de node_modules y archivos temporales
└── README.md                   # Documentación técnica completa
```

### Flujo de Datos Arquitectónico
```text
Cliente (React / Postman)
           ↓  (HTTP / JSON)
     [ Routes ]
           ↓
   [ Controllers ]
           ↓
    [ Services ]  (Lógica de negocio y validación)
           ↓
     [ Data ]     (Arreglos en memoria / Futura Base de Datos)
```

---

## 4. Instalación y Puesta en Marcha

### Requisitos previos
- Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
- Tener instalado `npm`.

### Paso 1: Instalar dependencias
Desde la raíz del proyecto, ejecute:
```bash
npm install
```

### Paso 2: Ejecución del servidor

- **Modo Producción / Estándar:**
  ```bash
  npm start
  ```

- **Modo Desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```

- **Ejecutar Pruebas Automatizadas:**
  ```bash
  npm test
  ```

El servidor iniciará por defecto en el puerto `3000`:
- **URL Base:** `http://localhost:3000`
- **Health Check:** `http://localhost:3000/api/health`

Si desea especificar un puerto diferente, configure la variable de entorno `PORT`:
```bash
PORT=4000 npm start
```

---

## 5. Formato Estándar de Respuestas JSON

Todas las respuestas de la API siguen una estructura consistente y predecible:

### Respuesta Exitosa con Datos
```json
{
  "success": true,
  "message": "Mensaje informativo",
  "data": { }
}
```

### Respuesta Exitosa sin Datos
```json
{
  "success": true,
  "message": "Operación realizada con éxito"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Descripción clara del error ocurrido"
}
```

---

## 6. Documentación Detallada de Endpoints

### 6.1. Health Check

#### Verificar Estado del Servidor
- **Método**: `GET`
- **Ruta**: `/api/health`
- **Respuesta (200 OK)**:
```json
{
  "success": true,
  "message": "API DioFaFarma funcionando correctamente"
}
```

---

### 6.2. Autenticación (`/api/auth`)

Usuarios registrados por defecto en memoria:
- **Usuario**: `admin`
- **Contraseña**: `123456`

#### Registrar Usuario
- **Método**: `POST`
- **Ruta**: `/api/auth/register`
- **Cuerpo (JSON)**:
```json
{
  "usuario": "farmaceutico1",
  "password": "claveSegura123"
}
```
- **Respuestas**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "message": "Usuario registrado correctamente"
    }
    ```
  - `400 Bad Request` (Campos incompletos o vacíos):
    ```json
    {
      "success": false,
      "message": "El usuario y la contraseña son obligatorios"
    }
    ```
  - `409 Conflict` (Usuario ya registrado):
    ```json
    {
      "success": false,
      "message": "El usuario ya existe"
    }
    ```

#### Iniciar Sesión (Login)
- **Método**: `POST`
- **Ruta**: `/api/auth/login`
- **Cuerpo (JSON)**:
```json
{
  "usuario": "admin",
  "password": "123456"
}
```
- **Respuestas**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "Autenticación satisfactoria",
      "data": {
        "usuario": "admin"
      }
    }
    ```
  - `401 Unauthorized` (Credenciales inválidas):
    ```json
    {
      "success": false,
      "message": "Error en la autenticación"
    }
    ```
  - `400 Bad Request` (Falta usuario o contraseña):
    ```json
    {
      "success": false,
      "message": "El usuario y la contraseña son obligatorios"
    }
    ```

---

### 6.3. Productos (`/api/productos`)

#### Modelo de Datos del Producto
| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | `Number` | Auto | Identificador único autoincremental |
| `codigo` | `String` | Sí | Código de barras o SKU (Único en inventario) |
| `nombre` | `String` | Sí | Nombre comercial del medicamento |
| `descripcion` | `String` | No | Detalle farmacológico / posología |
| `laboratorio` | `String` | No | Laboratorio fabricante |
| `precioCompra`| `Number` | Sí | Costo de adquisición (>= 0) |
| `precioVenta` | `Number` | Sí | Precio de venta al público (>= 0) |
| `stock` | `Number` | Sí | Unidades disponibles (>= 0) |
| `estado` | `Boolean`| Sí | `true` (activo/disponible) o `false` (inactivo) |

> [!NOTE]
> Las propiedades `precioCompra` y `precioVenta` respetan estrictamente la convención camelCase requerida por la interfaz de React.

---

#### 1. Listar Todos los Productos
- **Método**: `GET`
- **Ruta**: `/api/productos`
- **Respuesta (200 OK)**:
```json
{
  "success": true,
  "message": "Productos obtenidos correctamente",
  "data": [
    {
      "id": 1,
      "codigo": "MED001",
      "nombre": "Acetaminofén 500mg",
      "descripcion": "Analgésico",
      "laboratorio": "Laboratorio Demo",
      "precioCompra": 2000,
      "precioVenta": 3500,
      "stock": 50,
      "estado": true
    },
    {
      "id": 2,
      "codigo": "MED002",
      "nombre": "Ibuprofeno 400mg",
      "descripcion": "Antiinflamatorio",
      "laboratorio": "Laboratorio Demo",
      "precioCompra": 2500,
      "precioVenta": 4500,
      "stock": 30,
      "estado": true
    }
  ]
}
```

---

#### 2. Consultar Producto por ID
- **Método**: `GET`
- **Ruta**: `/api/productos/:id`
- **Ejemplo**: `GET http://localhost:3000/api/productos/1`
- **Respuestas**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "Producto encontrado",
      "data": {
        "id": 1,
        "codigo": "MED001",
        "nombre": "Acetaminofén 500mg",
        "descripcion": "Analgésico",
        "laboratorio": "Laboratorio Demo",
        "precioCompra": 2000,
        "precioVenta": 3500,
        "stock": 50,
        "estado": true
      }
    }
    ```
  - `404 Not Found`:
    ```json
    {
      "success": false,
      "message": "Producto no encontrado"
    }
    ```
  - `400 Bad Request` (Si el ID no es numérico):
    ```json
    {
      "success": false,
      "message": "El ID proporcionado no es válido"
    }
    ```

---

#### 3. Crear Producto
- **Método**: `POST`
- **Ruta**: `/api/productos`
- **Cuerpo (JSON)**:
```json
{
  "codigo": "MED003",
  "nombre": "Loratadina 10mg",
  "descripcion": "Antialérgico",
  "laboratorio": "Laboratorio Demo",
  "precioCompra": 3000,
  "precioVenta": 5000,
  "stock": 20,
  "estado": true
}
```
- **Respuestas**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "message": "Producto creado correctamente",
      "data": {
        "id": 3,
        "codigo": "MED003",
        "nombre": "Loratadina 10mg",
        "descripcion": "Antialérgico",
        "laboratorio": "Laboratorio Demo",
        "precioCompra": 3000,
        "precioVenta": 5000,
        "stock": 20,
        "estado": true
      }
    }
    ```
  - `409 Conflict` (Código ya existente):
    ```json
    {
      "success": false,
      "message": "El código del producto ya existe"
    }
    ```
  - `400 Bad Request` (Datos inválidos o faltantes):
    ```json
    {
      "success": false,
      "message": "El nombre del producto es obligatorio"
    }
    ```

---

#### 4. Actualizar Producto por ID
- **Método**: `PUT`
- **Ruta**: `/api/productos/:id`
- **Ejemplo**: `PUT http://localhost:3000/api/productos/1`
- **Cuerpo (JSON)**:
```json
{
  "codigo": "MED001",
  "nombre": "Acetaminofén 500mg Forte",
  "descripcion": "Analgésico y antipirético",
  "laboratorio": "Laboratorio DioFa",
  "precioCompra": 2200,
  "precioVenta": 3800,
  "stock": 60,
  "estado": true
}
```
- **Respuestas**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "Producto actualizado correctamente",
      "data": {
        "id": 1,
        "codigo": "MED001",
        "nombre": "Acetaminofén 500mg Forte",
        "descripcion": "Analgésico y antipirético",
        "laboratorio": "Laboratorio DioFa",
        "precioCompra": 2200,
        "precioVenta": 3800,
        "stock": 60,
        "estado": true
      }
    }
    ```
  - `404 Not Found`:
    ```json
    {
      "success": false,
      "message": "Producto no encontrado"
    }
    ```
  - `409 Conflict` (Si el nuevo código colisiona con el de otro producto):
    ```json
    {
      "success": false,
      "message": "El código del producto ya existe"
    }
    ```

---

#### 5. Eliminar Producto por ID
- **Método**: `DELETE`
- **Ruta**: `/api/productos/:id`
- **Ejemplo**: `DELETE http://localhost:3000/api/productos/2`
- **Respuestas**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "Producto eliminado correctamente"
    }
    ```
  - `404 Not Found`:
    ```json
    {
      "success": false,
      "message": "Producto no encontrado"
    }
    ```

---

## 7. Tabla Resumen de Códigos HTTP

| Código | Significado | Escenario |
| :---: | :--- | :--- |
| `200` | OK | Lectura, actualización o eliminación exitosa |
| `201` | Created | Registro exitoso de usuario o creación de producto |
| `400` | Bad Request | Faltan campos obligatorios, valores negativos o tipos incorrectos |
| `401` | Unauthorized | Credenciales de usuario inválidas en login |
| `404` | Not Found | Producto no encontrado por ID o ruta inexistente |
| `409` | Conflict | Usuario o código de producto ya existente |
| `500` | Internal Server Error | Excepción no controlada gestionada por el middleware |

---

## 8. Ejemplos de Pruebas (cURL / Postman)

### Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

### Registro de Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"usuario\": \"supervisor\", \"password\": \"clave2026\"}"
```

### Iniciar Sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"usuario\": \"admin\", \"password\": \"123456\"}"
```

### Listar Productos
```bash
curl -X GET http://localhost:3000/api/productos
```

### Crear Producto
```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d "{\"codigo\":\"MED003\",\"nombre\":\"Amoxicilina 500mg\",\"descripcion\":\"Antibiótico\",\"laboratorio\":\"Lab XYZ\",\"precioCompra\":3500,\"precioVenta\":6000,\"stock\":40,\"estado\":true}"
```

### Actualizar Producto
```bash
curl -X PUT http://localhost:3000/api/productos/1 \
  -H "Content-Type: application/json" \
  -d "{\"codigo\":\"MED001\",\"nombre\":\"Acetaminofén 500mg\",\"descripcion\":\"Analgésico con nueva presentación\",\"laboratorio\":\"Laboratorio Demo\",\"precioCompra\":2100,\"precioVenta\":3600,\"stock\":75,\"estado\":true}"
```

### Eliminar Producto
```bash
curl -X DELETE http://localhost:3000/api/productos/1
```

---

## 9. Guía de Consumo desde el Frontend (React)

La API cuenta con soporte nativo de **CORS** preconfigurado para `http://localhost:5173` (puerto habitual de Vite / React).

### Opción A: Usando la API estándar `fetch()`

#### 1. Obtener lista de productos
```javascript
import { useEffect, useState } from "react";

export function CatalogoProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/productos")
      .then((res) => res.json())
      .then((resultado) => {
        if (resultado.success) {
          setProductos(resultado.data);
        }
      })
      .catch((error) => console.error("Error al cargar productos:", error))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando catálogo...</p>;

  return (
    <ul>
      {productos.map((prod) => (
        <li key={prod.id}>
          {prod.codigo} - {prod.nombre} (${prod.precioVenta}) - Stock: {prod.stock}
        </li>
      ))}
    </ul>
  );
}
```

#### 2. Crear un producto
```javascript
export async function registrarProducto(nuevoProducto) {
  try {
    const respuesta = await fetch("http://localhost:3000/api/productos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nuevoProducto)
    });

    const data = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(data.message || "Error al crear producto");
    }

    return data;
  } catch (error) {
    console.error("Error en la solicitud:", error.message);
    throw error;
  }
}
```

---

### Opción B: Usando `Axios`

#### Configuración de un cliente centralizado (`apiClient.js`):
```javascript
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json"
  }
});
```

#### Login en un componente:
```javascript
import { api } from "./apiClient";

export async function loginUsuario(usuario, password) {
  try {
    const response = await api.post("/auth/login", { usuario, password });
    return response.data; // { success: true, message: "...", data: { usuario: "..." } }
  } catch (error) {
    const mensaje = error.response?.data?.message || "Error de conexión";
    throw new Error(mensaje);
  }
}
```

---

## 10. Transición a Base de Datos en el Futuro

La arquitectura implementada respeta el principio de inversión de dependencias:
1. **Controladores**: Solamente reciben la solicitud HTTP y devuelven la respuesta JSON correspondiente.
2. **Servicios**: Contienen las reglas del negocio, validaciones y lógica de dominio.
3. **Datos / Repositorios**: Actualmente encapsulado en `data/users.js` y `data/productos.js`.

Para migrar a una base de datos física en etapas posteriores (como PostgreSQL, MongoDB o MySQL), bastará con reemplazar las referencias a los arreglos en `src/services/*` por consultas a modelos u ORMs (como Prisma, Sequelize o Mongoose), sin requerir cambios en la capa de controladores ni en los contratos de la API consumidos por React.
