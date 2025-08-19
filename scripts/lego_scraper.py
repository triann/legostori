import requests
from bs4 import BeautifulSoup
import json
import re
import time
from urllib.parse import urljoin
import sys
import random

# Configure aqui a categoria que será aplicada a todos os produtos desta execução
# Opções: ["novos"], ["exclusivos"], ["ofertas"], ["novos", "ofertas"], etc.
CATEGORIA_PRODUTOS = ["novos", "ofertas"]  # Altere esta linha antes de executar o script

class LegoScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.product_counter = 10
        
    def extract_product_data(self, url):
        """Extrai dados de um produto específico"""
        try:
            print(f"Extraindo dados de: {url}")
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extrair nome do produto
            name = self.extract_name(soup)
            
            # Extrair preços
            price = self.extract_price(soup)
            
            # Extrair imagens
            images = self.extract_images(soup, url)
            
            # Extrair descrição (limitada a 6 linhas)
            description = self.extract_description(soup)
            
            # Extrair número de peças
            pieces = self.extract_pieces(soup)
            
            # Extrair idade recomendada
            age = self.extract_age(soup)
            
            item_number = self.extract_item_number(url)
            
            vip_points = self.extract_vip_points(soup, price)
            
            rating = round(random.uniform(4.0, 5.0), 1)
            reviews = random.randint(50, 500)
            
            categories = self.get_categories_input(name)
            
            product_data = {
                "id": str(self.product_counter),
                "name": name,
                "price": price,
                "originalPrice": None,  # Sempre null
                "rating": rating,
                "reviews": reviews,
                "ages": age,
                "pieces": pieces,
                "itemNumber": item_number,
                "vipPoints": vip_points,
                "images": images,
                "description": description,
                "features": [],  # Array vazio conforme solicitado
                "inStock": True,  # Sempre em estoque
                "puzzleImage": images[0] if images else "/placeholder.svg?height=400&width=400&text=LEGO+Product",  # Primeira imagem como puzzle
                "puzzleTimeLimit": 300,  # Tempo limite do puzzle
                "puzzleDiscount": 70,     # Desconto padrão do puzzle
                "categories": categories  # Adicionada propriedade categories
            }
            
            self.product_counter += 1
            
            print(f"✓ Produto extraído: {name}")
            return product_data
            
        except Exception as e:
            print(f"✗ Erro ao extrair {url}: {str(e)}")
            return None
    
    def extract_name(self, soup):
        """Extrai o nome do produto"""
        selectors = [
            'h1.vtex-store-components-3-x-productNameContainer',
            'h1[data-testid="product-name"]',
            '.product-name h1',
            'h1.product-title',
            'h1'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        
        return "Produto LEGO"
    
    def extract_price(self, soup):
        """Extrai o preço do produto"""
        selectors = [
            '.vtex-product-price-1-x-sellingPrice',
            '.vtex-store-components-3-x-currencyContainer',
            '.price-selling',
            '.product-price .selling-price',
            '[data-testid="price-selling"]'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                price_text = element.get_text().strip()
                # Extrair apenas números e vírgula/ponto
                price_match = re.search(r'[\d.,]+', price_text.replace('R$', '').replace(' ', ''))
                if price_match:
                    price_str = price_match.group().replace('.', '').replace(',', '.')
                    try:
                        return float(price_str)
                    except:
                        continue
        
        return 299.99  # Preço padrão
    
    def extract_original_price(self, soup, current_price):
        """Extrai o preço original (sem desconto)"""
        selectors = [
            '.vtex-product-price-1-x-listPrice',
            '.price-list',
            '.original-price',
            '[data-testid="price-list"]'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                price_text = element.get_text().strip()
                price_match = re.search(r'[\d.,]+', price_text.replace('R$', '').replace(' ', ''))
                if price_match:
                    price_str = price_match.group().replace('.', '').replace(',', '.')
                    try:
                        original = float(price_str)
                        if original > current_price:
                            return original
                    except:
                        continue
        
        # Se não encontrar preço original, calcular baseado no preço atual
        return round(current_price * 1.2, 2)  # 20% a mais que o preço atual

    def extract_images(self, soup, base_url):
        """Extrai URLs das imagens do produto"""
        images = []
        
        # Seletores para imagens
        selectors = [
            '.vtex-store-components-3-x-productImageTag',
            '.product-image img',
            '.vtex-product-images img',
            'img[src*="legobrasil.vtexassets.com"]',
            'img[src*="lego"]'
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            for img in elements:
                src = img.get('src') or img.get('data-src')
                if src and 'lego' in src.lower():
                    # Converter URL relativa para absoluta
                    full_url = urljoin(base_url, src)
                    if full_url not in images:
                        images.append(full_url)
        
        # Se não encontrou imagens, usar placeholder
        if not images:
            images = ["/placeholder.svg?height=400&width=400&text=LEGO+Product"]
        
        return images[:4]  # Máximo 4 imagens
    
    def extract_description(self, soup):
        """Retorna sempre uma descrição padrão para todos os produtos"""
        return "Construa, brinque e exiba! Este incrível conjunto LEGO oferece uma experiência de construção envolvente com peças de alta qualidade e detalhes autênticos. Perfeito para fãs de todas as idades, este conjunto proporciona horas de diversão criativa e é ideal para exibição. Inclui instruções passo a passo e elementos únicos que tornam cada construção especial. Desperte sua imaginação e crie memórias duradouras com este fantástico conjunto LEGO."
    
    def extract_pieces(self, soup):
        """Extrai o número de peças"""
        pieces_element = soup.select_one('.legobrasil-product-0-x-specificationsProductItemTitle')
        if pieces_element:
            pieces_text = pieces_element.get_text()
            pieces_match = re.search(r'(\d+)', pieces_text)
            if pieces_match:
                return int(pieces_match.group(1))
        
        # Fallback para busca geral no texto
        text = soup.get_text()
        patterns = [
            r'(\d+)\s*pe[çc]as?',
            r'(\d+)\s*pcs?',
            r'(\d+)\s*pieces?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return 150  # Valor padrão
    
    def extract_age(self, soup):
        """Extrai a idade recomendada"""
        text = soup.get_text()
        
        # Procurar padrões como "8+", "6-12", "18+ anos"
        patterns = [
            r'(\d+)\+\s*anos?',
            r'(\d+)\+',
            r'(\d+)\s*-\s*\d+\s*anos?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return f"{match.group(1)}+"
        
        return "8+"  # Valor padrão
    
    def scrape_products(self, urls):
        """Extrai dados de múltiplos produtos"""
        products = []
        
        print(f"Iniciando extração de {len(urls)} produtos...")
        
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Processando produto...")
            
            product_data = self.extract_product_data(url)
            if product_data:
                products.append(product_data)
            
            # Delay entre requisições para não sobrecarregar o servidor
            time.sleep(2)
        
        return products
    
    def save_to_json(self, products, filename="produtos_lego.json"):
        """Salva os produtos em arquivo JavaScript com chaves sem aspas"""
        products_dict = {}
        for product in products:
            products_dict[product["id"]] = product
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("// Mock product data - in a real app this would come from a database\n")
            f.write("const products = {\n")
            
            for i, (key, product) in enumerate(products_dict.items()):
                f.write(f'  "{key}": {{\n')
                f.write(f'    id: "{product["id"]}",\n')
                f.write(f'    name: "{product["name"]}",\n')
                f.write(f'    price: {product["price"]},\n')
                f.write(f'    originalPrice: null,\n')
                f.write(f'    rating: {product["rating"]},\n')
                f.write(f'    reviews: {product["reviews"]},\n')
                f.write(f'    ages: "{product["ages"]}",\n')
                f.write(f'    pieces: {product["pieces"]},\n')
                f.write(f'    itemNumber: "{product["itemNumber"]}",\n')
                f.write(f'    vipPoints: {product["vipPoints"]},\n')
                f.write(f'    images: {json.dumps(product["images"])},\n')
                f.write(f'    description: "{product["description"]}",\n')
                f.write(f'    features: [],\n')
                f.write(f'    inStock: {str(product["inStock"]).lower()},\n')
                f.write(f'    puzzleImage: "{product["puzzleImage"]}",\n')
                f.write(f'    puzzleTimeLimit: {product["puzzleTimeLimit"]},\n')
                f.write(f'    puzzleDiscount: {product["puzzleDiscount"]},\n')
                f.write(f'    categories: {json.dumps(product["categories"])}\n')  # Adicionada linha categories
                
                # Adicionar vírgula se não for o último item
                if i < len(products_dict) - 1:
                    f.write('  },\n')
                else:
                    f.write('  }\n')
            
            f.write('};\n')
        
        print(f"\n✓ {len(products)} produtos salvos em {filename}")

    def extract_item_number(self, url):
        """Extrai o número do item da URL"""
        match = re.search(r'/(\d+)-', url)
        if match:
            return match.group(1)
        return "00000"
    
    def extract_vip_points(self, soup, price):
        """Extrai VIP points do site ou calcula baseado no preço"""
        # Procurar por VIP points no site
        vip_selectors = [
            '[data-testid="vip-points"]',
            '.vip-points',
            '.loyalty-points'
        ]
        
        for selector in vip_selectors:
            element = soup.select_one(selector)
            if element:
                vip_text = element.get_text()
                vip_match = re.search(r'(\d+)', vip_text)
                if vip_match:
                    return int(vip_match.group(1))
        
        # Se não encontrar, calcular baseado no preço (aproximadamente 6.5% do preço)
        return int(price * 0.065)
    
    def get_categories_input(self, product_name):
        """Retorna a categoria configurada no topo do arquivo"""
        print(f"📦 Produto: {product_name} -> Categorias: {CATEGORIA_PRODUTOS}")
        return CATEGORIA_PRODUTOS

def main():
    # URLs de exemplo - substitua pelas URLs reais
    urls = []
    
    # Tentar ler URLs do arquivo urls.txt
    try:
        with open('scripts/urls.txt', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                # Ignorar linhas vazias e comentários
                if line and not line.startswith('#'):
                    urls.append(line)
        print(f"✓ {len(urls)} URLs carregadas do arquivo urls.txt")
    except FileNotFoundError:
        print("❌ Arquivo urls.txt não encontrado!")
        print("Crie o arquivo scripts/urls.txt e adicione as URLs dos produtos (uma por linha)")
        return
    except Exception as e:
        print(f"❌ Erro ao ler urls.txt: {e}")
        return
    
    if not urls:
        print("❌ Nenhuma URL válida encontrada no arquivo urls.txt")
        return
    
    # Se URLs foram passadas como argumentos, usar elas ao invés do arquivo
    if len(sys.argv) > 1:
        urls = sys.argv[1:]
        print(f"✓ Usando {len(urls)} URLs dos argumentos da linha de comando")
    
    scraper = LegoScraper()
    products = scraper.scrape_products(urls)
    
    if products:
        scraper.save_to_json(products)
        print(f"\n🎉 Extração concluída! {len(products)} produtos processados.")
    else:
        print("\n❌ Nenhum produto foi extraído com sucesso.")

if __name__ == "__main__":
    main()
