import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and location */}
          <div className="space-y-4">
            <div className="bg-red-600 text-white font-bold text-2xl px-3 py-1 rounded w-fit">LEGO</div>
            <div className="flex items-center gap-2 text-sm">
              <span>📍</span>
              <span>Brasil</span>
            </div>
            <div className="space-y-2 text-sm">
              <p>Cartões presente</p>
              <p>Mapa do site</p>
              <p>Encontre inspiração</p>
              <p>Catálogos LEGO</p>
              <p>Encontre uma loja LEGO</p>
            </div>
          </div>

          {/* About Us */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">SOBRE NÓS</h3>
            <div className="space-y-2 text-sm">
              <p>Sobre o Grupo LEGO</p>
              <p>Notícias LEGO®</p>
              <p>Sustentabilidade</p>
              <p>Declaração de transparência da cadeia de suprimentos</p>
              <p>Certificação de produtos LEGO</p>
              <p>Empregos LEGO</p>
              <p>Linha de Conformidade LEGO</p>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">SUPORTE</h3>
            <div className="space-y-2 text-sm">
              <p>Entre em contato</p>
              <p>Encontre instruções de montagem</p>
              <p>Peças de reposição</p>
              <p>Entregas e devoluções</p>
              <p>Métodos de pagamento</p>
              <p>Termos e condições</p>
              <p>Recalls de produtos</p>
            </div>
          </div>

          {/* Attractions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">ATRAÇÕES</h3>
            <div className="space-y-2 text-sm">
              <p>LEGO® House</p>
              <p>Parques LEGOLAND®</p>
              <p>Centros de Descoberta LEGOLAND</p>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">MAIS DE NÓS</h4>
              <div className="space-y-2 text-sm">
                <p>Revista LEGO® (GRÁTIS)</p>
                <p>LEGO Education</p>
                <p>LEGO Ideas</p>
                <p>Fundação LEGO</p>
                <p>Programa de afiliados</p>
                <p>Ofertas para estudantes e exclusivas</p>
                <p>Blocos LEGO braille</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">INSCREVA-SE PARA RECEBER E-MAILS DE MARKETING DIGITAL</h3>
            </div>
            <div className="flex gap-2 flex-1 max-w-md">
              <Input placeholder="Seu endereço de e-mail" className="bg-slate-800 border-slate-600 text-white" />
              <Button className="bg-orange-500 hover:bg-orange-600">→</Button>
            </div>
            <div className="flex gap-4">
              <h4 className="font-semibold">SIGA-NOS</h4>
              <div className="flex gap-2">
                <Facebook className="w-5 h-5 cursor-pointer hover:text-blue-400" />
                <Twitter className="w-5 h-5 cursor-pointer hover:text-blue-400" />
                <Instagram className="w-5 h-5 cursor-pointer hover:text-pink-400" />
                <Youtube className="w-5 h-5 cursor-pointer hover:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div className="border-t border-slate-700 pt-6 text-xs text-slate-400">
          <div className="flex flex-wrap gap-4 mb-4">
            <span>Política de privacidade</span>
            <span>Cookies</span>
            <span>Aviso legal</span>
            <span>Termos de uso</span>
            <span>Bem-estar digital</span>
            <span>Acessibilidade</span>
            <span>Configurações de cookies</span>
            <span>Não vender/compartilhar minhas informações pessoais</span>
          </div>
          <p className="text-xs">
            LEGO System A/S, DK-7190 Billund, Dinamarca. Deve ter 18 anos ou mais para comprar online. LEGO, o logotipo
            LEGO, a Minifigura, DUPLO, o logotipo FRIENDS, o logotipo MINIFIGURES, DREAMZzz, NINJAGO, VIDIYO e
            MINDSTORMS são marcas registradas do Grupo LEGO. ©2025 O Grupo LEGO. Todos os direitos reservados. O uso
            deste site significa sua concordância com os Termos de Uso.
          </p>
        </div>
      </div>
    </footer>
  )
}
