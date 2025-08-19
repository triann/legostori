import { Header } from "@/components/header"
import { ProductDetails } from "@/components/product-details"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"

// Mock product data - in a real app this would come from a database
const products = {
  "1": {
    id: "1",
    name: "Disney - Mini Castelo da Disney",
    price: 329.99,
    originalPrice: null,
    rating: 4.8,
    reviews: 156,
    ages: "8+",
    pieces: 567,
    itemNumber: "76230",
    vipPoints: 1875,
    images: [
      "https://legobrasil.vtexassets.com/arquivos/ids/176770/lego_40478_Disney_Mini_Castelo_da_Disney_01.jpg?v=637732735262400000",
      "https://legobrasil.vtexassets.com/arquivos/ids/176771/lego_40478_Disney_Mini_Castelo_da_Disney_02.jpg?v=637732735276170000",
    ],
    description:
      "Comemore o 50º aniversário do Walt Disney World® Resort com este conjunto LEGO® | Disney Mini Disney Castle (40478)! Os fãs do carro-chefe da Disney Magic Kingdom® Park podem recriar o icônico Walt Disney World® Resort Cinderella Castle, completo com topos de torres douradas peroladas, cones de telhado azul opalescente e uma minifigura de estilo vintage do Mickey Mouse. Esta peça de exibição única é um presente perfeito para aniversários, feriados ou outras comemorações.",
    features: [
      "Figura Soundwave altamente detalhada e articulada",
      "Inclui acessórios de fita cassete",
      "Base de exibição premium para colecionador incluída",
      "Estilo e cores autênticos dos Transformers",
      "Perfeito para exibição em qualquer coleção",
    ],
    inStock: true,
    puzzleImage:
      "https://legobrasil.vtexassets.com/arquivos/ids/176770/lego_40478_Disney_Mini_Castelo_da_Disney_01.jpg?v=637732735262400000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 25,
    categories: ["novos", "exclusivos"],
  },
  "2": {
    id: "2",
    name: "Disney - Casa de Praia Lilo e Stitch",
    price: 899.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 203,
    ages: "8+",
    pieces: 834,
    itemNumber: "31212",
    vipPoints: 1500,
    images: [
      "https://legobrasil.vtexassets.com/arquivos/ids/188946/43268.jpg?v=638731528542870000",
      "https://legobrasil.vtexassets.com/arquivos/ids/188951/43268--5-.jpg?v=638863846455970000",
    ],
    description:
      "Aventuras incríveis aguardam fãs e crianças a partir de 9 anos neste conjunto de construção LEGO® | Disney Lilo e Stitch Beach House (43268). Apresentando um modelo de casa de praia de 2 níveis, este brinquedo montável da Disney tem muitos detalhes do filme e ovos de Páscoa, incluindo 2 pranchas de surfe, a boneca Scrump da Lilo, um toca-discos, um pote de picles, uma nave espacial construída com peças, além de 5 minifiguras de personagens LEGO | Disney – David, Lilo, Sr. Bubbles, Nani e Stitch – para uma brincadeira divertida sem fim.",
    features: [
      "Representação cientificamente precisa da galáxia",
      "Mecanismo de braços espirais rotativos",
      "Sistema de iluminação LED incluído",
      "Livreto de informações educacionais",
      "Base de exibição premium com placa de identificação",
    ],
    inStock: true,
    puzzleImage: "https://legobrasil.vtexassets.com/arquivos/ids/188946/43268.jpg?v=638731528542870000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 20,
    categories: ["exclusivos"],
  },
  "3": {
    id: "3",
    name: "Mala de Viagem Amarela",
    price: 149.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 89,
    ages: "7+",
    pieces: 184,
    itemNumber: "21333",
    vipPoints: 1500,
    images: [
      "https://legobrasil.vtexassets.com/arquivos/ids/189242/40817.jpg?v=638768033043630000",
      "https://legobrasil.vtexassets.com/arquivos/ids/189248/40817--6-.jpg?v=638768033863470000",
    ],
    description:
      "Pegue seu passaporte e prepare-se para a aventura com este kit de construção de modelo de mala de viagem LEGO® Yellow Travel Suitcase (40817). Este conjunto com tema de férias é um presente divertido para crianças de 7 anos ou mais, ou qualquer pessoa que ame viajar. A mini mala possui uma alça retrátil, rodas funcionais e uma etiqueta de bagagem. Abra a mala para embalar a câmera, o cartão de embarque, a escova de dentes e o passaporte - divirta-se fazendo tudo caber! O conjunto vem com uma folha de adesivos divertida para personalizar a parte externa da mala.",
    features: [
      "Recriação autêntica dos Girassóis de van Gogh",
      "Inclui moldura decorativa para pendurar na parede",
      "Técnica única de construção de arte LEGO",
      "Vem com minifigura de van Gogh",
      "Livreto de informações sobre história da arte incluído",
    ],
    inStock: true,
    puzzleImage: "https://legobrasil.vtexassets.com/arquivos/ids/189242/40817.jpg?v=638768033043630000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 15,
    categories: ["ofertas", "novos"],
  },
  "4": {
    id: "4",
    name: "Minecraft® - Ringue de luta da mansão Woodland",
    price: 479.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 89,
    ages: "7+",
    pieces: 491,
    itemNumber: "21333",
    vipPoints: 1500,
    images: [
      "https://legobrasil.vtexassets.com/arquivos/ids/189063/21272.jpg?v=638738549970430000",
      "https://legobrasil.vtexassets.com/arquivos/ids/189069/21272--6-.jpg?v=638738553786900000",
    ],
    description:
      "O conjunto de construção LEGO® Minecraft apresenta figuras de brinquedo do filme – Steve, Garrett, Henry, um bebê zumbi, um jóquei de galinha e um porco grande posável – além de armas e poções que as crianças podem usar enquanto recriam cenas de batalha e exploram suas próprias aventuras. O conjunto apresenta um ringue de luta funcional com marcadores de pontuação e alças que as crianças podem prender aos lutadores. Há também uma fachada de mansão com um baú removível e suporte para armas. Para diversão digital, o aplicativo LEGO Builder permite que as crianças ampliem, girem modelos em 3D e acompanhem seu progresso.",
    features: [
      "Recriação autêntica dos Girassóis de van Gogh",
      "Inclui moldura decorativa para pendurar na parede",
      "Técnica única de construção de arte LEGO",
      "Vem com minifigura de van Gogh",
      "Livreto de informações sobre história da arte incluído",
    ],
    inStock: true,
    puzzleImage: "https://legobrasil.vtexassets.com/arquivos/ids/189063/21272.jpg?v=638738549970430000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 15,
    categories: ["novos"],
  },
  "5": {
    id: "5",
    name: "Speed Champions - Ferrari F40 Supercar",
    price: 479.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 89,
    ages: "7+",
    pieces: 318,
    itemNumber: "21333",
    vipPoints: 1500,
    images: [
      "https://legobrasil.vtexassets.com/arquivos/ids/187718/76934.jpg?v=638646997377600000",
      "https://legobrasil.vtexassets.com/arquivos/ids/187726/76934--10-.jpg?v=638646998339130000",
    ],
    description:
      "Meninos e meninas com mais de 9 anos podem colecionar, construir, brincar e exibir este incrível brinquedo de carro LEGO® Speed Champions Ferrari F40 (76934). Projetado para celebrar o 40º aniversário da icônica marca de carros italiana, o F40 foi o último modelo aprovado pessoalmente pelo fundador da Ferrari, Enzo Ferrari, e este fantástico veículo montável para crianças apresenta muitos detalhes de design famosos da versão da vida real.",
    features: [
      "Recriação autêntica dos Girassóis de van Gogh",
      "Inclui moldura decorativa para pendurar na parede",
      "Técnica única de construção de arte LEGO",
      "Vem com minifigura de van Gogh",
      "Livreto de informações sobre história da arte incluído",
    ],
    inStock: true,
    puzzleImage: "https://legobrasil.vtexassets.com/arquivos/ids/189063/21272.jpg?v=638738549970430000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 15,
    categories: ["exclusivos"],
  },
  "6": {
    id: "6",
    name: "Harry Potter™ - Passeio de moto de Hagrid™ e Harr",
    price: 479.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 89,
    ages: "7+",
    pieces: 617,
    itemNumber: "21333",
    vipPoints: 1500,
    images: [
      "https://legobrasil.vtexassets.com/arquivos/ids/188029/76443.jpg?v=638689283624800000",
      "https://legobrasil.vtexassets.com/arquivos/ids/188035/76443--6-.jpg?v=638689285167900000",
    ],
    description:
      "Segure firme para o Passeio de Motocicleta de Hagrid™ e Harry (76443) com este brinquedo mágico para meninas, meninos e qualquer fã do Mundo Mágico. Um presente de aniversário legal para crianças de 9 anos ou mais, este conjunto de brincar e exibir LEGO® Harry Potter™ apresenta figuras de brinquedo Harry Potter, Hedwig™ e Rubeus Hagrid integradas e articuladas andando em uma motocicleta e em seu sidecar. As rodas do brinquedo de veículo construído com peças LEGO giram para que as crianças possam encenar cenas icônicas de Harry Potter e as Relíquias da Morte™, ou o modelo pode ser exibido como uma decoração impressionante de quarto de Harry Potter.",
    features: [
      "Recriação autêntica dos Girassóis de van Gogh",
      "Inclui moldura decorativa para pendurar na parede",
      "Técnica única de construção de arte LEGO",
      "Vem com minifigura de van Gogh",
      "Livreto de informações sobre história da arte incluído",
    ],
    inStock: true,
    puzzleImage: "https://legobrasil.vtexassets.com/arquivos/ids/188029/76443.jpg?v=638689283624800000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 15,
    categories: ["novos"],
  },
  "7": {
    id: "7",
    name: "Creator - Modelo 3 Em 1: Dinossauros Ferozes",
    price: 149.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 89,
    ages: "7+",
    pieces: 174,
    itemNumber: "21333",
    vipPoints: 1500,
    images: [
      "https://legobrasil.vtexassets.com/arquivos/ids/170220/31058_prod.jpg?v=637111671490100000",
      "https://legobrasil.vtexassets.com/arquivos/ids/170223/31058_box1_v29.jpg?v=638773831184270000",
    ],
    description:
      "Segure firme para o Passeio de Motocicleta de Hagrid™ e Harry (76443) com este brinquedo mágico para meninas, meninos e qualquer fã do Mundo Mágico. Um presente de aniversário legal para crianças de 9 anos ou mais, este conjunto de brincar e exibir LEGO® Harry Potter™ apresenta figuras de brinquedo Harry Potter, Hedwig™ e Rubeus Hagrid integradas e articuladas andando em uma motocicleta e em seu sidecar. As rodas do brinquedo de veículo construído com peças LEGO giram para que as crianças possam encenar cenas icônicas de Harry Potter e as Relíquias da Morte™, ou o modelo pode ser exibido como uma decoração impressionante de quarto de Harry Potter.",
    features: [
      "Recriação autêntica dos Girassóis de van Gogh",
      "Inclui moldura decorativa para pendurar na parede",
      "Técnica única de construção de arte LEGO",
      "Vem com minifigura de van Gogh",
      "Livreto de informações sobre história da arte incluído",
    ],
    inStock: true,
    puzzleImage: "https://legobrasil.vtexassets.com/arquivos/ids/170220/31058_prod.jpg?v=637111671490100000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 15,
    categories: ["ofertas"],
  },
  "8": {
    id: "8",
    name: "Ideas - Magia da Disney",
    price: 759.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 89,
    ages: "7+",
    pieces: 1103,
    itemNumber: "21333",
    vipPoints: 1500,
    images: [
      "https://legobrasil.vtexassets.com/arquivos/ids/187552/21352.jpg?v=638621859108970000",
      "https://legobrasil.vtexassets.com/arquivos/ids/187556/21352--4-.jpg?v=638621859598330000",
    ],
    description:
      "Com Mickey Mouse em sua roupa de aprendiz de feiticeiro no centro, este modelo colecionável exibe muitos personagens populares da Disney e inclui a primeira minifigura LEGO de Bela de A Bela e a Fera com a rosa encantada. Outras vinhetas incluem Gepeto em uma jangada em Pinóquio, Lilo surfando em Lilo & Stitch, Simba no topo da Pride Rock em O Rei Leão, Bruno na Madrigal House em Encanto, as vassouras mágicas carregando água em Fantasia e Sebastião, o caranguejo, e Linguado, o peixe em A Pequena Sereia.",
    features: [
      "Recriação autêntica dos Girassóis de van Gogh",
      "Inclui moldura decorativa para pendurar na parede",
      "Técnica única de construção de arte LEGO",
      "Vem com minifigura de van Gogh",
      "Livreto de informações sobre história da arte incluído",
    ],
    inStock: true,
    puzzleImage: "https://legobrasil.vtexassets.com/arquivos/ids/187552/21352.jpg?v=638621859108970000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 15,
    categories: ["exclusivos"],
  },
  "9": {
    id: "9",
    name: "City - Avião de Passageiros",
    price: 799.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 89,
    ages: "7+",
    pieces: 913,
    itemNumber: "21333",
    vipPoints: 1500,
    images: [
      "https://legobrasil.vtexassets.com/arquivos/ids/184072/60367-lego-city-aviao-de-passageiros.jpg?v=638276417925400000",
      "https://legobrasil.vtexassets.com/arquivos/ids/184075/60367-lego-city-aviao-de-passageiros--4-.jpg?v=638276418801630000",
    ],
    description:
      "Aqui está um agrado para fãs de modelos de aviões. Este conjunto LEGO® City Avião de Passageiros (60367) está repleto de recursos e funções realistas. O avião super elegante tem um interior detalhado com um cockpit, assentos, um corredor, banheiro e inclui uma escada de embarque, ônibus de embarque, trator de reboque, caminhão de comidas e caminhão de bagagem, além de 9 minifiguras para inspirar brincadeiras.",
    features: [
      "Recriação autêntica dos Girassóis de van Gogh",
      "Inclui moldura decorativa para pendurar na parede",
      "Técnica única de construção de arte LEGO",
      "Vem com minifigura de van Gogh",
      "Livreto de informações sobre história da arte incluído",
    ],
    inStock: true,
    puzzleImage:
      "https://legobrasil.vtexassets.com/arquivos/ids/184072/60367-lego-city-aviao-de-passageiros.jpg?v=638276417925400000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 15,
    categories: ["novos"],
  },
  "10": {
    id: "10",
    name: "Mala de Viagem Amarela",
    price: 149.99,
    originalPrice: null,
    rating: 4.5,
    reviews: 362,
    ages: "8+",
    pieces: 184,
    itemNumber: "40817",
    vipPoints: 9,
    images: ["https://legobrasil.vtexassets.com/arquivos/ids/189242/40817.jpg?v=638768033043630000", "https://legobrasil.vtexassets.com/arquivos/ids/189243/40817--1-.jpg?v=638768033204130000", "https://legobrasil.vtexassets.com/arquivos/ids/189244/40817--2-.jpg?v=638768033319000000", "https://legobrasil.vtexassets.com/arquivos/ids/189245/40817--3-.jpg?v=638768033475700000"],
    description: "Construa, brinque e exiba! Este incrível conjunto LEGO oferece uma experiência de construção envolvente com peças de alta qualidade e detalhes autênticos. Perfeito para fãs de todas as idades, este conjunto proporciona horas de diversão criativa e é ideal para exibição. Inclui instruções passo a passo e elementos únicos que tornam cada construção especial. Desperte sua imaginação e crie memórias duradouras com este fantástico conjunto LEGO.",
    features: [],
    inStock: true,
    puzzleImage: "https://legobrasil.vtexassets.com/arquivos/ids/189242/40817.jpg?v=638768033043630000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 70,
    categories: ["novos", "ofertas"]
  },
}

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products[params.id as keyof typeof products]

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <ProductDetails product={product} />
      <Footer />
    </div>
  )
}
