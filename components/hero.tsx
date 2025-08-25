interface HeroProps {
  discount?: number
}

export function Hero({ discount = 0 }: HeroProps) {
  const getHeroContent = () => {
    if (discount === 100) {
      return {
        title: "🎉 Parabéns! Você ganhou 100% de DESCONTO!",
        description:
          "Incrível! Você conquistou 100% de desconto na roleta! Todos os produtos LEGO estão grátis para você. Aproveite esta oportunidade única e monte sua coleção dos sonhos sem pagar nada!",
      }
    } else if (discount === 80) {
      return {
        title: "🎊 Fantástico! 80% de desconto conquistado!",
        description:
          "Você arrasou na roleta! Conquistou 80% de desconto em todos os produtos LEGO. Uma economia incrível te espera - aproveite para levar seus sets favoritos com este super desconto!",
      }
    } else {
      return {
        title: "Nova promoção Lego disponível!",
        description:
          "Escolha o LEGO que você deseja e descubra o quebra-cabeça exclusivo daquele set. Complete o desafio, gire a roleta e ganhe prêmios incríveis. Cada peça montada é uma chance de transformar diversão em recompensa – não perca a sua!",
      }
    }
  }

  const heroContent = getHeroContent()

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
              <h1 className="text-xl md:text-3xl font-bold">{heroContent.title}</h1>
              <p className="text-sm md:text-lg text-gray-300">{heroContent.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
