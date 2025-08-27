import { ProductPageClient, products } from "./ProductPageClient"

export { products }

export async function generateStaticParams() {
  return Object.keys(products).map((id) => ({
    id: id,
  }))
}

interface ProductPageProps {
  params: { id: string }
  searchParams: { discount?: string }
}

export default function ProductPage({ params, searchParams }: ProductPageProps) {
  return <ProductPageClient params={params} searchParams={searchParams} />
}
