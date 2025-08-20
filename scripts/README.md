# LEGO Store Scraper

Script Python para extrair dados de produtos da LEGO Store Brasil automaticamente.

## Instalação

1. Instale as dependências:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Como usar

### Método Recomendado: Arquivo urls.txt

1. **Adicione as URLs no arquivo `urls.txt`:**
   - Abra o arquivo `scripts/urls.txt`
   - Adicione uma URL por linha
   - Linhas que começam com # são comentários

2. **Execute o script:**
\`\`\`bash
python scripts/lego_scraper.py
\`\`\`

### Método Alternativo: URLs como argumentos
\`\`\`bash
python scripts/lego_scraper.py "https://www.legostore.com.br/produto1/p" "https://www.legostore.com.br/produto2/p"
\`\`\`

## Saída

O script gera um arquivo `produtos_lego.json` com todos os dados estruturados:

\`\`\`json
[
  {
    "id": "76285",
    "name": "Marvel - Máscara do Homem-Aranha",
    "price": 699.99,
    "pieces": 305,
    "age": "18+",
    "images": ["url1", "url2", "url3"],
    "description": "Descrição do produto...",
    "inStock": true,
    "rating": 4.8,
    "reviews": 156
  }
]
\`\`\`

## Recursos

- ✅ Extrai nome, preço, imagens, descrição
- ✅ Detecta número de peças e idade recomendada  
- ✅ Verifica disponibilidade em estoque
- ✅ URLs corretas das imagens do site brasileiro
- ✅ Delay entre requisições para não sobrecarregar
- ✅ Tratamento de erros robusto
- ✅ Suporte a arquivo urls.txt para facilitar uso em lote

## Fluxo de Trabalho

1. Cole todas as URLs dos produtos no `urls.txt`
2. Execute `python scripts/lego_scraper.py`
3. Aguarde a extração (2 segundos por produto)
4. Envie o arquivo `produtos_lego.json` gerado
5. Todos os produtos serão adicionados automaticamente ao sistema
