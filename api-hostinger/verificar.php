<?php
// Verificar da Vakinha - DOMÍNIOS CORRETOS

// IMPORTANTE: Configurar CORS ANTES de qualquer output
require_once __DIR__ . '/config.php';

// DEFINIR CORS IMEDIATAMENTE
setCorsHeaders();

// Headers obrigatórios
header('Content-Type: application/json; charset=utf-8');

// Log específico da vakinha
function writeLog($message, $data = null) {
    $logDir = __DIR__ . '/logs';
    if (!file_exists($logDir)) {
        mkdir($logDir, 0777, true);
    }
    
    $logFile = $logDir . '/verificar-vakinha-' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] [VERIFICAR-VAKINHA] $message\n";
    if ($data !== null) {
        $logMessage .= "Dados: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
    }
    $logMessage .= "----------------------------------------\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

writeLog("📥 Verificação solicitada", [
    'method' => $_SERVER['REQUEST_METHOD'],
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'não definido',
    'transaction_id' => $data['idtransaction'] ?? 'não fornecido'
]);

if (!isset($data['idtransaction'])) {
    writeLog("❌ ID da transação não fornecido");
    echo json_encode(['error' => 'ID da transação não fornecido']);
    exit;
}

$transactionId = trim($data['idtransaction']);

try {
    // Conectar ao banco da vakinha
    $db = new PDO("sqlite:" . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $db->prepare("SELECT * FROM pedidos WHERE transaction_id = :transaction_id");
    $stmt->execute(['transaction_id' => $transactionId]);
    $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pedido) {
        writeLog("❌ Pedido não encontrado", [
            'transaction_id' => $transactionId,
            'database' => DB_PATH
        ]);
        
        echo json_encode([
            'success' => false,
            'status' => 'error',
            'message' => 'Pedido não encontrado'
        ]);
        exit;
    }

    $status = 'PENDING';
    if ($pedido['status'] === 'paid' || $pedido['status'] === 'approved') {
        $status = 'APPROVED';
    }

    writeLog("✅ Status verificado", [
        'transaction_id' => $transactionId,
        'status' => $status,
        'database' => DB_PATH
    ]);

    echo json_encode([
        'success' => true,
        'status' => $status,
        'transaction_id' => $pedido['transaction_id'],
        'operacao' => 'vakinha',
        'data' => [
            'amount' => $pedido['valor'],
            'created_at' => $pedido['created_at'],
            'updated_at' => $pedido['updated_at'],
            'customer' => [
                'name' => $pedido['nome'],
                'email' => $pedido['email'],
                'document' => $pedido['cpf']
            ]
        ]
    ]);

} catch (Exception $e) {
    writeLog("❌ Erro na verificação", ['message' => $e->getMessage()]);
    
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Erro ao verificar o status do pagamento'
    ]);
}
?>
