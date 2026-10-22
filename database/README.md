# Base de datos

`remy.sql` es el único documento SQL de instalación. Contiene el esquema integrado de los módulos y las filas de ejemplo del proyecto.

Está preparado para instalaciones nuevas. Antes de cambiar una base existente, realiza una copia de seguridad y compara su estructura y datos; no uses este documento como actualización directa de una base operativa. La aplicación PHP conecta los módulos a la misma base MySQL. Platos, Inventario y Aprendices comparten la tabla `ingredientes`.
