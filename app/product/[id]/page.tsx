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
    ages: "18+",
    pieces: 1456,
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
    puzzleImage: "https://legobrasil.vtexassets.com/arquivos/ids/176770/lego_40478_Disney_Mini_Castelo_da_Disney_01.jpg?v=637732735262400000",
    puzzleTimeLimit: 300,
    puzzleDiscount: 25,
  },
  "2": {
    id: "2",
    name: "A Galáxia Via Láctea",
    price: 199.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 203,
    ages: "18+",
    pieces: 1969,
    itemNumber: "31212",
    vipPoints: 1500,
    images: ["/lego-milky-way.png", "/lego-milky-way-side.png", "/lego-milky-way-detail.png"],
    description:
      "Explore o cosmos com esta impressionante representação LEGO® da nossa Galáxia Via Láctea. Uma peça de exibição perfeita para entusiastas do espaço e colecionadores LEGO.",
    features: [
      "Representação cientificamente precisa da galáxia",
      "Mecanismo de braços espirais rotativos",
      "Sistema de iluminação LED incluído",
      "Livreto de informações educacionais",
      "Base de exibição premium com placa de identificação",
    ],
    inStock: true,
    puzzleImage: "/lego-milky-way.png",
    puzzleTimeLimit: 420,
    puzzleDiscount: 20,
  },
  "3": {
    id: "3",
    name: "Vincent van Gogh - Girassóis",
    price: 199.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 89,
    ages: "18+",
    pieces: 2316,
    itemNumber: "21333",
    vipPoints: 1500,
    images: ["/lego-van-gogh-sunflowers.png", "/lego-sunflowers-frame.png", "/lego-van-gogh-sunflowers-detail.png"],
    description:
      "Recrie a obra-prima 'Girassóis' de Vincent van Gogh em forma LEGO®. Esta experiência de construção artística combina criatividade com uma das pinturas mais amadas da história.",
    features: [
      "Recriação autêntica dos Girassóis de van Gogh",
      "Inclui moldura decorativa para pendurar na parede",
      "Técnica única de construção de arte LEGO",
      "Vem com minifigura de van Gogh",
      "Livreto de informações sobre história da arte incluído",
    ],
    inStock: true,
    puzzleImage: "/lego-van-gogh-sunflowers.png",
    puzzleTimeLimit: 480,
    puzzleDiscount: 15,
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
