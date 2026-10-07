<?php
include 'conexion.php';

header('Content-Type: application/json');

$response = array();

$sql = "SELECT
            id_experiencia AS IdExperiencia,
            nombre AS Nombre,
            descripcion AS Descripcion,
            precio AS Precio,
            img_experiencia AS ImgExperiencia
        FROM experiencias
        WHERE estado = 'activo'";

$result = $conn->query($sql);

if ($result->num_rows > 0) {

    while ($row = $result->fetch_assoc()) {
        $response[] = $row;
    }

}

echo json_encode($response);

$conn->close();
?>
