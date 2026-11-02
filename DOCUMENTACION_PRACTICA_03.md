# REGISTRA-IP — Práctica 03
## Wizard de registro de obra

**Estudiante:** Evelin Francheska Narvaez Alfonso

### 1. Descripción
Desarrollo de un asistente de cuatro pasos para registrar obras, adjuntar archivos y guardar su información.

### 2. Tecnologías
- React y Vite.
- Node.js y Express.
- Multer.
- Git y GitHub.

### 3. Funcionamiento
1. Seleccionar archivo.
2. Ingresar título, categoría y descripción.
3. Revisar la vista previa.
4. Confirmar el registro y generar el folio.

### 4. Validaciones
- Archivo obligatorio.
- Título mínimo de cinco caracteres.
- Categoría obligatoria.
- No permite avanzar si los datos son incorrectos.
- Conserva la información al regresar.

### 5. Almacenamiento
- `uploads/`: guarda los archivos.
- `data/obras/`: guarda los registros JSON.

### 6. Folios personalizados
Se utiliza el prefijo `OBRA-0840-`.

Ejemplos:
- OBRA-0840-001
- OBRA-0840-002
- OBRA-0840-003

### 7. Ejecución
Backend:
```bash
node server.js
```

Frontend:
```bash
npm run dev
```

Compilación:
```bash
npm run build
```

### 8. Defensa oral

**Pregunta: ¿Por qué se validó por paso y no todo al final?**

Se validó por paso para detectar errores inmediatamente, evitar datos incompletos y permitir que el usuario corrija la información antes de continuar. Así se mejora la experiencia y se evita llegar al final con errores.

### 9. Conclusión
Se implementó un wizard funcional de cuatro pasos con validaciones, barra de progreso, generación de folios y conexión con un backend para almacenar archivos y datos.