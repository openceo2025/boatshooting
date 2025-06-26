<?php
require_once 'db.php';

$pdo = getPDO();
$stmt = $pdo->query('SELECT name, score FROM scores ORDER BY score DESC, id ASC LIMIT 3');
$scores = $stmt->fetchAll();
header('Content-Type: application/json');

echo json_encode($scores);
