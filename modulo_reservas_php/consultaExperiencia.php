<?php
include 'conexion.php';
header('Content-Type: application/json');

$res = mysqli_query($conexion, "SELECT * FROM experiencias");
$data = [];

while($row = mysqli_fetch_assoc($res)) {
    
    $row['precio'] = (int)$row['precio'];
    $data[] = $row;
}

echo json_encode($data);
?>