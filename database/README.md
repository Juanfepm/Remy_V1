# Base de datos

`remy.sql` documenta una instalación nueva. `migracion_integracion.sql` proviene del proyecto original y contiene cambios sobre tablas existentes. La aplicación PHP usa la misma base MySQL de REMY; cambiar de lenguaje no requiere borrar ni recrear datos.

Antes de aplicar SQL a una base con información real, comparar su esquema con estos scripts y realizar copia de seguridad. No ejecutar `remy.sql` sobre producción suponiendo que la estructura es idéntica. Los servicios de platos conservan tablas `ingredientes` y `plato_ingrediente` para recetas; no hay módulo web/API de inventario.
