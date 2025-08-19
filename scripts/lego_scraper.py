import requests
from bs4 import BeautifulSoup
import json
import re
import time
from urllib.parse import urljoin
import sys
import random
import os

# Configure aqui a categoria que será aplicada a todos os produtos desta execução
# Opções: ["novos"], ["exclusivos"], ["ofertas"], ["novos", "ofertas"], etc.
CATEGORIA_PRODUTOS = ["novos"]  # Altere esta linha antes de executar o script

class LegoScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.control_file = "scripts/produtos_processados.json"
        self.processed_products = self.load_processed_products()
        self.product_counter = self.get_next_id()
        
    def load_processed_products(self):
        """Carrega produtos já processados do arquivo de controle"""
        if os.path.exists(self.control_file):
            try:
                with open(self.control_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ Erro ao carregar arquivo de controle: {e}")
                return {}
        return {}
    
    def get_next_id(self):
        """Retorna o próximo ID disponível baseado nos produtos já processados"""
        if not self.processed_products:
            return 10
        
        max_id = max([int(product["id"]) for product in self.processed_products.values()])
        return max_id + 1
    
    def save_processed_products(self):
        """Salva produtos processados no arquivo de controle"""
        try:
            os.makedirs(os.path.dirname(self.control_file), exist_ok=True)
            with open(self.control_file, 'w', encoding='utf-8') as f:
                json.dump(self.processed_products, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"⚠️ Erro ao salvar arquivo de controle: {e}")
    
    def check_duplicate_product(self, item_number, name):
        """Verifica se produto já existe baseado no itemNumber"""
        for product_id, product in self.processed_products.items():
            if product.get("itemNumber") == item_number:
                return product_id, product
        return None, None
    
    def merge_categories(self, existing_product, new_categories):
        """Faz merge das categorias do produto existente com as novas"""
        existing_categories = existing_product.get("categories", [])
        
        # Adicionar novas categorias que não existem
        for category in new_categories:
            if category not in existing_categories:
                existing_categories.append(category)
        
        existing_product["categories"] = existing_categories
        return existing_product
        
    def extract_product_data(self, url):
        """Extrai dados de um produto específico"""
        try:
            print(f"Extraindo dados de: {url}")
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extrair dados básicos
            name = self.extract_name(soup)
            item_number = self.extract_item_number(url)
            
            existing_id, existing_product = self.check_duplicate_product(item_number, name)
            
            if existing_product:
                print(f"🔄 Produto já existe (ID: {existing_id}): {name}")
                print(f"   Adicionando categorias {CATEGORIA_PRODUTOS} ao produto existente")
                
                # Fazer merge das categorias
                updated_product = self.merge_categories(existing_product, CATEGORIA_PRODUTOS)
                self.processed_products[existing_id] = updated_product
                
                return updated_product
            
            # Se não existe, extrair todos os dados
            price = self.extract_price(soup)
            images = self.extract_images(soup, url)
            description = self.extract_description(soup)
            pieces = self.extract_pieces(soup)
            age = self.extract_age(soup)
            vip_points = self.extract_vip_points(soup, price)
            rating = round(random.uniform(4.0, 5.0), 1)
            reviews = random.randint(50, 500)
            
            product_data = {
                "id": str(self.product_counter),
                "name": name,
                "price": price,
                "originalPrice": None,
                "rating": rating,
                "reviews": reviews,
                "ages": age,
                "pieces": pieces,
                "itemNumber": item_number,
                "vipPoints": vip_points,
                "images": images,
                "description": description,
                "features": [],
                "inStock": True,
                "puzzleImage": images[0] if images else "/placeholder.svg?height=400&width=400&text=LEGO+Product",
                "puzzleTimeLimit": 300,
                "puzzleDiscount": 70,
                "categories": CATEGORIA_PRODUTOS.copy()  # Usar cópia da lista de categorias
            }
            
            self.processed_products[str(self.product_counter)] = product_data
            self.product_counter += 1
            
            print(f"✓ Novo produto adicionado: {name} (ID: {product_data['id']})")
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
        print(f"Categoria configurada: {CATEGORIA_PRODUTOS}")
        print(f"Produtos já processados: {len(self.processed_products)}")
        print(f"Próximo ID disponível: {self.product_counter}")
        
        for i, url in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Processando produto...")
            
            product_data = self.extract_product_data(url)
            if product_data:
                products.append(product_data)
            
            # Delay entre requisições
            time.sleep(2)
        
        self.save_processed_products()
        
        return products
    
    def save_to_json(self, products, filename="produtos_lego.js"):
        """Salva TODOS os produtos processados (não apenas os novos) em arquivo JavaScript"""
        all_products = self.processed_products
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("// Mock product data - in a real app this would come from a database\n")
            f.write("const products = {\n")
            
            sorted_products = sorted(all_products.items(), key=lambda x: int(x[0]))
            
            for i, (key, product) in enumerate(sorted_products):
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
                f.write(f'    categories: {json.dumps(product["categories"])}\n')
                
                if i < len(sorted_products) - 1:
                    f.write('  },\n')
                else:
                    f.write('  }\n')
            
            f.write('};\n')
        
        print(f"\n✓ {len(all_products)} produtos totais salvos em {filename}")
        print(f"📊 Resumo da execução:")
        print(f"   - Produtos processados nesta execução: {len(products)}")
        print(f"   - Total de produtos no sistema: {len(all_products)}")

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
    urls = []
    
    try:
        with open('scripts/urls.txt', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
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
    
    if len(sys.argv) > 1:
        urls = sys.argv[1:]
        print(f"✓ Usando {len(urls)} URLs dos argumentos da linha de comando")
    
    scraper = LegoScraper()
    products = scraper.scrape_products(urls)
    
    if products:
        scraper.save_to_json(products)
        print(f"\n🎉 Extração concluída!")
    else:
        print("\n❌ Nenhum produto foi extraído com sucesso.")

if __name__ == "__main__":
    main()
