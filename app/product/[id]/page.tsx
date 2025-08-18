import { Header } from "@/components/header"
import { ProductDetails } from "@/components/product-details"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"

// Mock product data - in a real app this would come from a database
const products = {
  "1": {
    id: "1",
    name: "Transformers: Soundwave",
    price: 249.99,
    originalPrice: null,
    rating: 4.8,
    reviews: 156,
    ages: "18+",
    pieces: 1456,
    itemNumber: "76230",
    vipPoints: 1875,
    images: [
      "/lego-soundwave.png",
      "/lego-soundwave-front.png",
      "/lego-soundwave-side.png",
      "/lego-soundwave-back.png",
    ],
    description:
      "Construa e exiba esta impressionante figura LEGO® Transformers Soundwave. Este modelo detalhado captura o visual icônico do oficial de comunicações Decepticon com detalhes autênticos e articulações móveis.",
    features: [
      "Figura Soundwave altamente detalhada e articulada",
      "Inclui acessórios de fita cassete",
      "Base de exibição premium para colecionador incluída",
      "Estilo e cores autênticos dos Transformers",
      "Perfeito para exibição em qualquer coleção",
    ],
    inStock: true,
    puzzleImage: "/lego-soundwave.png",
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
