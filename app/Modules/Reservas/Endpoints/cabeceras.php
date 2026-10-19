<?php


// Todas las páginas y API se sirven desde el mismo origen.



if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
