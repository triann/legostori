<?php
// Configuração da Vakinha - DOMÍNIOS CORRETOS

// URLs da aplicação - DOMÍNIOS REAIS
define('FRONTEND_URL', 'https://legostore.online');
define('API_BASE_URL', 'https://monkeycheckout.online/vakinha-luky');

define('FRONTEND_DOMAIN', 'https://legostore.online');
define('BACKEND_DOMAIN', 'https://monkeycheckout.online/vakinha-luky');

// Configurações SkalePay - CHAVES DA VAKINHA
define('SKALEPAY_SECRET_KEY', 'sk_live_v2oF4Bti0WiPRNgx18ub8b365Dz3n8A2lxBSpwpgud');
define('SKALEPAY_API_URL', 'https://api.conta.skalepay.com.br/v1');

// Configurações Utmify - TOKEN DA VAKINHA
define('UTMIFY_TOKEN', '4BN9awBwCPnyWWptnywmYhkdE4QW3Bnz4Ow5');
define('UTMIFY_API_URL', 'https://api.utmify.com.br/api-credentials/orders');

// Database isolado - USANDO __DIR__ para caminho correto
define('DB_PATH', __DIR__ . '/database.sqlite');

// URLs específicas da vakinha - CAMINHOS CORRETOS
define('WEBHOOK_URL', 'https://monkeycheckout.online/vakinha-luky/webhook.php');
define('UTMIFY_PENDENTE_URL', 'https://monkeycheckout.online/vakinha-luky/utmify-pendente.php');
define('UTMIFY_APROVADO_URL', 'https://monkeycheckout.online/vakinha-luky/utmify.php');

// CORS CONFIGURADO PARA DOMÍNIOS REAIS
function setCorsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Domínios permitidos - ESPECÍFICOS
    $allowedOrigins = [
        'https://legostore.online',
        'http://localhost', // Para testes locais
        'http://127.0.0.1', // Para testes locais
        'https://localhost' // Para testes locais com SSL
    ];
    
    // Log da origem para debug
    error_log("[CORS] Origin recebida: " . $origin);
    
    // Verificar se a origem está permitida
    if (in_array($origin, $allowedOrigins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        error_log("[CORS] Origin permitida: " . $origin);
    } else {
        // Para requisições diretas (sem origin), permitir
        if (empty($origin)) {
            header('Access-Control-Allow-Origin: *');
            error_log("[CORS] Origin vazia - permitindo todas");
        } else {
            error_log("[CORS] Origin NÃO permitida: " . $origin);
        }
    }
    
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // Cache preflight por 24 horas
    
    // Responder a requisições OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        error_log("[CORS] Respondendo OPTIONS preflight");
        http_response_code(200);
        exit();
    }
}

// Criar database se não existir - CAMINHO CORRETO
if (!file_exists(DB_PATH)) {
    touch(DB_PATH);
    chmod(DB_PATH, 0644);
}

// Criar diretório de logs se não existir - CAMINHO CORRETO
$logDir = __DIR__ . '/logs';
if (!file_exists($logDir)) {
    mkdir($logDir, 0777, true);
}
?>
