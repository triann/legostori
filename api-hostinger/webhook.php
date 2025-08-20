<?php
require_once __DIR__ . '/config.php';

// DEFINIR CORS IMEDIATAMENTE
setCorsHeaders();

header('Content-Type: application/json; charset=utf-8');

// Log específico do webhook
function writeLog($message, $data = null) {
    $logDir = __DIR__ . '/logs';
    if (!file_exists($logDir)) {
        mkdir($logDir, 0777, true);
    }
    
    $logFile = $logDir . '/webhook-' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] [WEBHOOK] $message\n";
    if ($data !== null) {
        $logMessage .= "Dados: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
    }
    $logMessage .= "----------------------------------------\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    writeLog("📥 Webhook recebido", $data);
    
    if (!isset($data['id'])) {
        throw new Exception('ID da transação não fornecido');
    }
    
    $transactionId = $data['id'];
    $status = $data['status'] ?? 'unknown';
    
    // Conectar ao banco
    $db = new PDO("sqlite:" . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Atualizar status no banco
    $stmt = $db->prepare("UPDATE pedidos SET status = :status, updated_at = :updated_at WHERE transaction_id = :transaction_id");
    $stmt->execute([
        'status' => $status,
        'updated_at' => date('c'),
        'transaction_id' => $transactionId
    ]);
    
    writeLog("✅ Status atualizado", [
        'transaction_id' => $transactionId,
        'status' => $status
    ]);
    
    echo json_encode(['success' => true]);
    
} catch (Exception $e) {
    writeLog("❌ Erro no webhook", ['message' => $e->getMessage()]);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
