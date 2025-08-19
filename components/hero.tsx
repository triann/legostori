import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative">
        <div className="w-full" style={{ aspectRatio: "15/8" }}>
          <img
            src="https://legobrasil.vtexassets.com/assets/vtex.file-manager-graphql/images/9b001bba-61d5-44f9-8112-33f31c537eda___fb49f0cd4436b31a9adab76c1fb05d72.jpg"
            alt="Promoção LEGO"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Seção de texto com fundo escuro */}
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-2 md:px-4 py-6 md:py-8">
            <div className="text-center space-y-4 md:space-y-6">
              <h1 className="text-xl md:text-3xl font-bold">Nova promoção Lego disponível!</h1>
              <p className="text-sm md:text-lg text-gray-300">
                Escolha o LEGO que você deseja e descubra o quebra-cabeça exclusivo daquele set. Complete o desafio, gire a roleta e ganhe prêmios incríveis. Cada peça montada é uma chance de transformar diversão em recompensa – não perca a sua!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
