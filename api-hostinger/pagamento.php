<?php
require_once __DIR__ . '/config.php';

header('Access-Control-Allow-Origin: https://legostore.online');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// DEFINIR CORS IMEDIATAMENTE
setCorsHeaders();

// Habilita o log de erros
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Função para gerar CPF válido
function gerarCPF() {
    $cpf = '';
    for ($i = 0; $i < 9; $i++) {
        $cpf .= rand(0, 9);
    }

    $soma = 0;
    for ($i = 0; $i < 9; $i++) {
        $soma += intval($cpf[$i]) * (10 - $i);
    }
    $resto = $soma % 11;
    $digito1 = ($resto < 2) ? 0 : 11 - $resto;
    $cpf .= $digito1;

    $soma = 0;
    for ($i = 0; $i < 10; $i++) {
        $soma += intval($cpf[$i]) * (11 - $i);
    }
    $resto = $soma % 11;
    $digito2 = ($resto < 2) ? 0 : 11 - $resto;
    $cpf .= $digito2;

    $invalidos = [
        '00000000000', '11111111111', '22222222222', '33333333333', 
        '44444444444', '55555555555', '66666666666', '77777777777', 
        '88888888888', '99999999999'
    ];

    if (in_array($cpf, $invalidos)) {
        return gerarCPF();
    }

    return $cpf;
}

// Função para gerar telefone aleatório
function gerarTelefone() {
    $ddds = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '87'];
    $ddd = $ddds[array_rand($ddds)];
    $numero = '9' . rand(10000000, 99999999);
    return $ddd . $numero;
}

// Função para gerar nome aleatório
function gerarNome() {
    $nomes_masculinos = [
        'Cliente Padrão', 'Cliente Padrão', 'Cliente Padrão'
    ];

    $nomes_femininos = [
        'Cliente Padrão', 'Cliente Padrão', 'Cliente Padrão'
    ];

    $genero = rand(0, 1);
    return $genero ? 
        $nomes_masculinos[array_rand($nomes_masculinos)] : 
        $nomes_femininos[array_rand($nomes_femininos)];
}

// Função para gerar email aleatório
function gerarEmail($nome) {
    $dominios = ['gmail.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com', 'uol.com.br'];
    $nomeEmail = strtolower(str_replace(' ', '.', $nome));
    $dominio = $dominios[array_rand($dominios)];
    return $nomeEmail . '@' . $dominio;
}

try {
    // Configurações da API
    $apiUrl = 'https://api.conta.skalepay.com.br/v1';
    $secretKey = 'sk_live_v2oF4Bti0WiPRNgx18ub8b365Dz3n8A2lxBSpwpgud'; 

    // Conecta ao SQLite (arquivo de banco de dados)
    $dbPath = __DIR__ . '/database.sqlite';
    $db = new PDO("sqlite:$dbPath");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifica se a tabela 'pedidos' existe e cria/atualiza se necessário
    $db->exec("CREATE TABLE IF NOT EXISTS pedidos (
        transaction_id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        valor INTEGER NOT NULL,
        nome TEXT,
        email TEXT,
        cpf TEXT,
        telefone TEXT,
        utm_params TEXT,
        created_at TEXT,
        updated_at TEXT
    )");

    // Verifica se a coluna telefone existe, se não, adiciona
    try {
        $db->query("SELECT telefone FROM pedidos LIMIT 1");
    } catch (PDOException $e) {
        // Coluna não existe, vamos adicioná-la
        error_log("[Database] Adicionando coluna telefone à tabela pedidos");
        $db->exec("ALTER TABLE pedidos ADD COLUMN telefone TEXT");
    }

    // Recebe os parâmetros
    $valor = isset($_GET['valor']) ? intval($_GET['valor']) : null;
    
    if (!$valor || $valor <= 0) {
        throw new Exception('Valor inválido ou não informado');
    }

    $valor_centavos = $valor;

    // Capturar dados do corpo da requisição JSON
    $json = file_get_contents('php://input');
    $requestData = json_decode($json, true);
    
    // Verificar se é uma requisição do index.html (sem dados do usuário) ou checkout.html (com dados)
    $isFromIndex = empty($requestData) || 
                   (empty($requestData['nome']) && empty($requestData['email'])) ||
                   (!isset($requestData['nome']) && !isset($requestData['email']));
    
    if ($isFromIndex) {
        // GERAÇÃO AUTOMÁTICA PARA INDEX.HTML
        error_log("[Pagamento] 🎯 Requisição do index.html - gerando dados automaticamente");
        
        $nome_cliente = gerarNome();
        $email_cliente = gerarEmail($nome_cliente);
        $cpf_cliente = gerarCPF();
        $telefone_cliente = gerarTelefone();
        
        // Parâmetros UTM (podem vir mesmo do index)
        $utmParams = [
            'utm_source' => $requestData['utm_source'] ?? null,
            'utm_medium' => $requestData['utm_medium'] ?? null,
            'utm_campaign' => $requestData['utm_campaign'] ?? null,
            'utm_content' => $requestData['utm_content'] ?? null,
            'utm_term' => $requestData['utm_term'] ?? null,
            'xcod' => $requestData['xcod'] ?? null,
            'sck' => $requestData['sck'] ?? null,
            'utm_id' => $requestData['utm_id'] ?? null
        ];
        
        error_log("[Pagamento] 🎲 Dados gerados automaticamente: " . json_encode([
            'nome' => $nome_cliente,
            'email' => $email_cliente,
            'cpf' => $cpf_cliente,
            'telefone' => $telefone_cliente
        ]));
        
    } else {
        // DADOS DO CHECKOUT.HTML - APENAS NOME E EMAIL REAIS
        error_log("[Pagamento] 📝 Requisição do checkout.html - usando nome e email do usuário");
        
        $nome_usuario = trim($requestData['nome'] ?? '');
        $email_usuario = trim($requestData['email'] ?? '');
        
        // Validações para checkout
        if (empty($email_usuario) || !filter_var($email_usuario, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('E-mail válido é obrigatório');
        }
        
        // USAR DADOS REAIS DO USUÁRIO APENAS PARA NOME E EMAIL
        $nome_cliente = !empty($nome_usuario) ? $nome_usuario : gerarNome();
        $email_cliente = $email_usuario;
        
        // SEMPRE GERAR CPF E TELEFONE AUTOMATICAMENTE (IGUAL AO INDEX)
        $cpf_cliente = gerarCPF();
        $telefone_cliente = gerarTelefone();
        
        error_log("[Pagamento] 📝 Dados do checkout - Nome: " . $nome_cliente . " | Email: " . $email_cliente);
        error_log("[Pagamento] 🎲 CPF e telefone gerados automaticamente: " . $cpf_cliente . " | " . $telefone_cliente);
        
        // Parâmetros UTM
        $utmParams = [
            'utm_source' => $requestData['utm_source'] ?? null,
            'utm_medium' => $requestData['utm_medium'] ?? null,
            'utm_campaign' => $requestData['utm_campaign'] ?? null,
            'utm_content' => $requestData['utm_content'] ?? null,
            'utm_term' => $requestData['utm_term'] ?? null,
            'xcod' => $requestData['xcod'] ?? null,
            'sck' => $requestData['sck'] ?? null,
            'utm_id' => $requestData['utm_id'] ?? null
        ];
    }

    $utmParams = array_filter($utmParams, function($value) {
        return $value !== null && $value !== '';
    });

    error_log("[Pagamento] 📝 Dados finais para API: " . json_encode([
        'valor' => $valor_centavos,
        'nome' => $nome_cliente,
        'email' => $email_cliente,
        'cpf' => $cpf_cliente,
        'telefone' => $telefone_cliente,
        'utm_params' => count($utmParams) . ' parâmetros'
    ]));

    // ENVIAR EVENTO PENDENTE PARA UTMIFY ANTES DE CRIAR A TRANSAÇÃO
    try {
        error_log("[Utmify] 📤 Enviando evento pendente para Utmify...");
        
        $utmifyPendenteData = [
            'orderId' => uniqid('LEGO_'),
            'customer' => [
                'name' => $nome_cliente,
                'email' => $email_cliente,
                'document' => $cpf_cliente,
                'phone' => $telefone_cliente
            ],
            'products' => [
                [
                    'id' => 'LEGO_PRODUCT_001',
                    'name' => 'Produto LEGO',
                    'quantity' => 1,
                    'priceInCents' => $valor_centavos
                ]
            ],
            'trackingParameters' => [
                'src' => $utmParams['utm_source'] ?? null,
                'sck' => $utmParams['sck'] ?? null,
                'utm_source' => $utmParams['utm_source'] ?? null,
                'utm_campaign' => $utmParams['utm_campaign'] ?? null,
                'utm_medium' => $utmParams['utm_medium'] ?? null,
                'utm_content' => $utmParams['utm_content'] ?? null,
                'utm_term' => $utmParams['utm_term'] ?? null,
                'xcod' => $utmParams['xcod'] ?? null,
                'fbclid' => null,
                'gclid' => null,
                'ttclid' => null
            ],
            'commission' => [
                'totalPriceInCents' => $valor_centavos,
                'gatewayFeeInCents' => 0,
                'userCommissionInCents' => 0
            ]
        ];
        
        $utmifyUrl = 'https://' . $_SERVER['HTTP_HOST'] . '/vakinha-luky/utmify-pendente.php';
        
        $ch = curl_init($utmifyUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($utmifyPendenteData),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_CONNECTTIMEOUT => 5
        ]);
        
        $utmifyResponse = curl_exec($ch);
        $utmifyHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($utmifyHttpCode === 200) {
            error_log("[Utmify] ✅ Evento pendente enviado com sucesso");
        } else {
            error_log("[Utmify] ⚠️ Falha ao enviar evento pendente: HTTP " . $utmifyHttpCode);
        }
        
    } catch (Exception $utmifyError) {
        error_log("[Utmify] ❌ Erro ao enviar evento pendente: " . $utmifyError->getMessage());
        // Não interrompe o fluxo principal
    }

    $data = [
        "amount" => $valor_centavos,
        "paymentMethod" => "pix",
        "customer" => [
            "name" => $nome_cliente,
            "email" => $email_cliente,
            "document" => [
                "type" => "cpf",
                "number" => $cpf_cliente
            ],
            "phone" => $telefone_cliente,
            "ip" => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
        ],
        "items" => [
            [
                "id" => uniqid('PROD_'),
                "title" => "Produto",
                "quantity" => 1,
                "unitPrice" => $valor_centavos,
                "tangible" => false
            ]
        ],
        "pix" => [
            "expiresIn" => 3600 // 1 hora de expiração
        ],
        "metadata" => json_encode($utmParams),
        "traceable" => true,
        "postbackUrl" => "https://" . $_SERVER['HTTP_HOST'] . "/webhook.php"
    ];

    error_log("[PagueSafe] 🌐 URL da requisição: " . $apiUrl . '/transactions');
    error_log("[PagueSafe] 📦 Dados enviados para API: " . json_encode($data, JSON_PRETTY_PRINT));

    // Autenticação
    $authString = $secretKey . ':x';
    $authHeader = 'Basic ' . base64_encode($authString);

    $ch = curl_init($apiUrl . '/transactions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'Authorization: ' . $authHeader,
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    if ($curlError) {
        error_log("[PagueSafe] ❌ Erro cURL: " . $curlError);
        throw new Exception("Erro na requisição: " . $curlError);
    }

    curl_close($ch);

    error_log("[PagueSafe] 📊 HTTP Status Code: " . $httpCode);
    error_log("[PagueSafe] 📄 Resposta da API: " . $response);

    if ($httpCode !== 200 && $httpCode !== 201) {
        throw new Exception("Erro na API: HTTP " . $httpCode . " - " . $response);
    }

    $result = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Erro ao decodificar resposta: " . json_last_error_msg());
    }

    if (!isset($result['id'])) {
        throw new Exception("ID da transação não encontrado na resposta da API");
    }

    // Extrair informações do PIX da resposta
    $pixCode = $result['pix']['qrcode'] ?? null;

    if (!$pixCode) {
        throw new Exception("Código PIX não encontrado na resposta da API");
    }

    // Gerar QR code usando serviço externo
    $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?data=' . urlencode($pixCode) . '&size=300x300&charset-source=UTF-8&charset-target=UTF-8&qzone=1&format=png&ecc=L';

    // Salva os dados no SQLite
    $stmt = $db->prepare("INSERT INTO pedidos (transaction_id, status, valor, nome, email, cpf, telefone, utm_params, created_at) 
        VALUES (:transaction_id, 'pending', :valor, :nome, :email, :cpf, :telefone, :utm_params, :created_at)");
    
    $insertResult = $stmt->execute([
        'transaction_id' => $result['id'],
        'valor' => $valor_centavos,
        'nome' => $nome_cliente,
        'email' => $email_cliente,
        'cpf' => $cpf_cliente,
        'telefone' => $telefone_cliente,
        'utm_params' => json_encode($utmParams),
        'created_at' => date('c')
    ]);

    if (!$insertResult) {
        error_log("[Database] ❌ Erro ao salvar no banco: " . json_encode($stmt->errorInfo()));
    }

    session_start();
    $_SESSION['payment_id'] = $result['id'];

    error_log("[PagueSafe] ✅ Transação criada com sucesso: " . $result['id']);

    // Preparar resposta
    $responseData = [
        'success' => true,
        'token' => $result['id'],
        'pixCode' => $pixCode,
        'pixCopiaECola' => $pixCode,
        'qrCodeUrl' => $qrCodeUrl,
        'valor' => $valor_centavos,
        'cliente' => [
            'nome' => $nome_cliente,
            'email' => $email_cliente,
            'cpf' => $cpf_cliente,
            'telefone' => $telefone_cliente
        ],
        'utm_params' => $utmParams,
        'source' => $isFromIndex ? 'index' : 'checkout'
    ];

    // Atualizar a transação com webhook UTMify configurado
    try {
        $updateData = [
            "postbackUrl" => "https://" . $_SERVER['HTTP_HOST'] . "/vakinha-luky/utmify-webhook.php"
        ];
        
        $ch = curl_init($apiUrl . '/transactions/' . $result['id']);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'PATCH',
            CURLOPT_POSTFIELDS => json_encode($updateData),
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . $authHeader,
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_TIMEOUT => 30
        ]);
        
        $updateResponse = curl_exec($ch);
        $updateHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($updateHttpCode === 200) {
            error_log("[Webhook] ✅ Webhook UTMify configurado com sucesso para transação: " . $result['id']);
        } else {
            error_log("[Webhook] ⚠️ Falha ao configurar webhook UTMify: HTTP " . $updateHttpCode);
        }
        
    } catch (Exception $webhookError) {
        error_log("[Webhook] ❌ Erro ao configurar webhook UTMify: " . $webhookError->getMessage());
        // Não interrompe o fluxo principal
    }

    error_log("[PagueSafe] 📤 Enviando resposta ao frontend");
    echo json_encode($responseData);

} catch (Exception $e) {
    error_log("[PagueSafe] ❌ Erro: " . $e->getMessage());
    error_log("[PagueSafe] 🔍 Stack trace: " . $e->getTraceAsString());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => 'PAYMENT_ERROR'
    ]);
}
?>
