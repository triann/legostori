import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "Loja Oficial LEGO® BR",
  description: "Lego Store",
  generator: "clona nao bb",
  icons: {
    icon: "https://legobrasil.vtexassets.com/assets/vtex/assets-builder/legobrasil.dup-template/1.28.0/logo___40c43ea8a6afef0f36be240072a0e00d.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>

        <Script
          id="utm-capture"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Importar e inicializar o UTM Manager
                  if (typeof window !== 'undefined') {
                    // Aguardar o carregamento do módulo
                    setTimeout(function() {
                      if (window.UTMManager) {
                        window.UTMManager.getInstance();
                        console.log('[UTM] Sistema de captura inicializado');
                      }
                    }, 100);
                  }
                } catch (error) {
                  console.error('[UTM] Erro ao inicializar captura:', error);
                }
              })();
            `,
          }}
        />

        <Script
          id="utmify-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.pixelId = "689d6967a9b91cc128240c1f";
              var a = document.createElement("script");
              a.setAttribute("async", "");
              a.setAttribute("defer", "");
              a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
              document.head.appendChild(a);
            `,
          }}
        />

        <Script src="https://cdn.utmify.com.br/scripts/utms/latest.js" strategy="afterInteractive" async defer />
      </head>
      <body>{children}</body>
    </html>
  )
}
