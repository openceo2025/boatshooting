<?php
require_once 'db.php';

$score = isset($_POST['score']) ? intval($_POST['score']) : 0;
$name = isset($_POST['name']) ? trim($_POST['name']) : 'anonymous';

if ($score > 0) {
    $pdo = getPDO();
    $stmt = $pdo->prepare('INSERT INTO scores (name, score, created_at) VALUES (?, ?, NOW())');
    $stmt->execute([$name, $score]);
    echo json_encode(['status' => 'ok']);
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'invalid score']);
}
