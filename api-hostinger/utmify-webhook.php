<?php
// Webhook UTMify para LEGO Store - Baseado no arquivo funcional

header('Content-Type: application/json');

$utmifyApiUrl = "https://api.utmify.com.br/api-credentials/orders";
$utmifyToken = "4BN9awBwCPnyWWptnywmYhkdE4QW3Bnz4Ow5";

// Log específico do LEGO Store
$logDir = __DIR__ . '/logs';
if (!file_exists($logDir)) {
    mkdir($logDir, 0777, true);
}
$logFile = $logDir . '/utmify-lego-' . date('Y-m-d') . '.log';

function writeLog($message, $data = null) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] [UTMIFY-LEGO] $message\n";
    if ($data !== null) {
        $logMessage .= "Dados: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
    }
    $logMessage .= "----------------------------------------\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

try {
    $rawData = file_get_contents('php://input');
    writeLog("📥 Dados recebidos do PayHub", ['raw' => $rawData]);

    $inputData = json_decode($rawData, true);
    if (!$inputData) {
        throw new Exception("Dados JSON inválidos");
    }

    writeLog("🔄 Processando dados recebidos", $inputData);

    // Verificar se o pagamento foi aprovado
    if ($inputData['status'] !== 'paid' && $inputData['status'] !== 'PAID' && 
        $inputData['status'] !== 'approved' && $inputData['status'] !== 'APPROVED') {
        writeLog("⏭️ Status ignorado", ['status' => $inputData['status']]);
        http_response_code(200);
        echo json_encode(['message' => 'Status ignorado']);
        exit;
    }

    // Preparar dados para UTMify
    $utmifyData = [
        'orderId' => $inputData['orderId'],
        'platform' => 'SkalePay',
        'paymentMethod' => 'pix',
        'status' => 'paid',
        'createdAt' => gmdate('Y-m-d H:i:s', strtotime($inputData['createdAt'])),
        'approvedDate' => gmdate('Y-m-d H:i:s', strtotime($inputData['paidAt'])),
        'refundedAt' => null,
        'customer' => [
            'name' => $inputData['customer']['name'],
            'email' => $inputData['customer']['email'],
            'phone' => $inputData['customer']['phone'] ?? null,
            'document' => $inputData['customer']['document']['number'],
            'country' => 'BR',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? null
        ],
        'products' => [
            [
                'id' => $inputData['items'][0]['id'] ?? uniqid(),
                'name' => $inputData['items'][0]['title'],
                'planId' => null,
                'planName' => null,
                'quantity' => $inputData['items'][0]['quantity'],
                'priceInCents' => $inputData['items'][0]['unitPrice']
            ]
        ],
        'trackingParameters' => [
            'src' => $inputData['trackingParameters']['src'] ?? null,
            'sck' => $inputData['trackingParameters']['sck'] ?? null,
            'utm_source' => $inputData['trackingParameters']['utm_source'] ?? null,
            'utm_campaign' => $inputData['trackingParameters']['utm_campaign'] ?? null,
            'utm_medium' => $inputData['trackingParameters']['utm_medium'] ?? null,
            'utm_content' => $inputData['trackingParameters']['utm_content'] ?? null,
            'utm_term' => $inputData['trackingParameters']['utm_term'] ?? null,
            'xcod' => $inputData['trackingParameters']['xcod'] ?? null,
            'fbclid' => $inputData['trackingParameters']['fbclid'] ?? null,
            'gclid' => $inputData['trackingParameters']['gclid'] ?? null,
            'ttclid' => $inputData['trackingParameters']['ttclid'] ?? null
        ],
        'commission' => [
            'totalPriceInCents' => $inputData['amount'],
            'gatewayFeeInCents' => $inputData['fee']['fixedAmount'] ?? 0,
            'userCommissionInCents' => $inputData['fee']['netAmount'] ?? $inputData['amount']
        ],
        'isTest' => false
    ];

    writeLog("📤 Dados formatados para Utmify", $utmifyData);

    // Enviar para UTMify
    $ch = curl_init($utmifyApiUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "x-api-token: $utmifyToken"
        ],
        CURLOPT_POSTFIELDS => json_encode($utmifyData)
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        writeLog("❌ Erro CURL", ['error' => curl_error($ch)]);
        throw new Exception("Erro ao enviar dados para Utmify: " . curl_error($ch));
    }
    
    curl_close($ch);

    writeLog("✅ Resposta da API Utmify", [
        'http_code' => $httpCode,
        'response' => json_decode($response, true)
    ]);

    if ($httpCode !== 200) {
        throw new Exception("Erro na API Utmify. HTTP Code: $httpCode");
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Dados enviados com sucesso para Utmify'
    ]);

} catch (Exception $e) {
    writeLog("❌ Erro", ['message' => $e->getMessage()]);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
