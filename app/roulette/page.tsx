"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RoulettePage() {
  const [attempt, setAttempt] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showTryAgainPopup, setShowTryAgainPopup] = useState(false)
  const [showWinPopup, setShowWinPopup] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [hasSeenTerms, setHasSeenTerms] = useState(false)
  const [currentNotification, setCurrentNotification] = useState(0)
  const router = useRouter()

  const notifications = [
    { name: "Pedro Oliveira", discount: "75%", image: "https://i.postimg.cc/RhB8zCK5/24.jpg" },
    { name: "Ana Alves", discount: "50%", image: "https://i.postimg.cc/prw31XTF/2.jpg" },
    { name: "Fernanda Santos", discount: "95%", image: "https://i.postimg.cc/X7FvNr9t/3.jpg" },
    { name: "Bruno Souza", discount: "25%", image: "https://i.postimg.cc/2ynfYBgw/5.jpg" },
    { name: "Fabrício Costa", discount: "75%", image: "https://i.postimg.cc/kXrTRHtD/6.jpg" },
    { name: "Juliana Lima", discount: "50%", image: "https://i.postimg.cc/0ynPrDjX/4.jpg" },
    { name: "Yasmin Araújo", discount: "95%", image: "https://i.postimg.cc/9XNrx3BF/10.jpg" },
    { name: "Lucilene Silva", discount: "75%", image: "https://i.postimg.cc/x8Wj92sv/11.jpg" },
    { name: "Everaldo Rocha", discount: "50%", image: "https://i.postimg.cc/nhFYvfVV/7.jpg" },
    { name: "Oswaldo Carvalho", discount: "25%", image: "https://i.postimg.cc/cHSQ4pzN/9.jpg" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNotification((prev) => (prev + 1) % notifications.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const handleSpin = () => {
    if (isSpinning) return

    if (!hasSeenTerms) {
      setShowTermsModal(true)
      return
    }

    setIsSpinning(true)

    if (attempt === 0) {
      setTimeout(() => {
        setShowTryAgainPopup(true)
        setIsSpinning(false)
        setAttempt((prev) => prev + 1)
      }, 10000)
    } else {
      setTimeout(() => {
        if (typeof window !== "undefined" && window.confetti) {
          window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        }
        setShowWinPopup(true)
        setIsSpinning(false)
        setAttempt((prev) => prev + 1)
      }, 10000)
    }
  }

  const handleAcceptTerms = () => {
    setShowTermsModal(false)
    setHasSeenTerms(true)
  }

  const handleTryAgain = () => {
    setShowTryAgainPopup(false)
  }

  const handleClaim80Discount = () => {
    setShowTryAgainPopup(false)
    router.push("/products?discount=80")
  }

  const handleClaimPrize = () => {
    setShowWinPopup(false)
    router.push("/products?discount=100")
  }

  const handleRisk = () => {
    // Implement handleRisk logic here
  }

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: "url(https://i.ibb.co/sdgdCHMz/bg-roleta.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section>
        <div className="cta">
          <div style={{ height: "195px" }}></div>
        </div>
        <div className="roulette">
          <img src="/placeholder.svg" id="roleta1" />
          <div id="roleta2">
            <img
              src="https://i.ibb.co/W4TcY4Wx/roleta.png"
              className={
                isSpinning
                  ? attempt === 0
                    ? "wheel__spinner_animated_retry_then_win"
                    : "wheel__spinner_animated"
                  : "spinner"
              }
            />
          </div>
          <img src="https://i.ibb.co/r97hXK6/button-gire.png" id="roleta3" />
        </div>
        <div className="button-roulette">
          <button onClick={handleSpin} disabled={isSpinning} id="button-cta" className="runSpin">
            {isSpinning ? "GIRANDO..." : "GIRE PARA GANHAR"}
          </button>
        </div>
      </section>

      {showTermsModal && (
        <>
          <div id="overlay" className="overlay" />
          <div id="popup-terms" className="popup terms-modal">
            <div className="popup-content">
              <div className="terms-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#ff0000" />
                </svg>
                <h2>Regulamento da Promoção</h2>
              </div>

              <div className="terms-content-simple">
                <p>
                  <strong>Parabéns!</strong> Você conquistou <strong>2 tentativas</strong> na nossa Roleta da Sorte!
                </p>

                <div className="terms-list">
                  <div className="term-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="#00aa00"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Promoção válida apenas hoje</span>
                  </div>

                  <div className="term-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                        stroke="#ff0000"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                        stroke="#ff0000"
                        strokeWidth="2"
                      />
                    </svg>
                    <span>Limitado a 1 participação por CPF</span>
                  </div>

                  <div className="term-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="#ff0000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Você tem 2 tentativas para ganhar</span>
                  </div>
                </div>

                <div className="warning-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="#ff6600"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>
                    <strong>Oferta limitada!</strong> Apenas hoje você tem essa oportunidade especial.
                  </span>
                </div>
              </div>

              <button onClick={handleAcceptTerms} id="accept-terms-button">
                Entendi!
              </button>
            </div>
          </div>
        </>
      )}

      {showTryAgainPopup && (
        <>
          <div id="overlay" className="overlay" />
          <div id="popup-try-again" className="popup">
            <div className="popup-content">
              <div className="success-header">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="#00aa00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2>Parabéns! Você Ganhou!</h2>
              </div>

              <div className="discount-info">
                <div className="discount-badge">80% OFF</div>
                <p>
                  Você conquistou <strong>80% de desconto</strong> em todos os produtos LEGO!
                </p>
                <p className="risk-text">
                  Mas você ainda tem <strong>1 chance</strong> para tentar ganhar o produto <strong>100% GRÁTIS</strong>
                  . O que você escolhe?
                </p>
                <p className="warning-text">
                  ⚠️ <strong>Atenção:</strong> Se você escolher "ARRISCAR TUDO", não poderá reverter essa decisão!
                </p>
              </div>

              <div className="action-buttons-vertical">
                <button onClick={handleClaim80Discount} className="claim-button-small">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  RESGATAR 80%
                </button>
                <button onClick={handleRisk} className="risk-button-small">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                  ARRISCAR TUDO
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showWinPopup && (
        <>
          <div id="overlay" className="overlay" />
          <div id="popup" className="popup">
            <div className="popup-content">
              <h2>Parabéns!</h2>
              <img src="/star-struck-happy-emoji-face-with-stars-in-eyes.png" alt="Emoji feliz" />
              <p>
                Você ganhou <strong>100% de desconto</strong> em nossos Kits Exclusivos de Natal,{" "}
                <strong>pague apenas o frete</strong>!
              </p>
              <button onClick={handleClaimPrize} id="resgatar-premio">
                Resgatar seu Prêmio
              </button>
            </div>
          </div>
        </>
      )}

      <div id="people" className="people">
        <img src={notifications[currentNotification].image || "/placeholder.svg"} id="people-img" alt="" />
        <p id="people-p">
          <strong>{notifications[currentNotification].name}</strong> acabou de ganhar{" "}
          <strong>{notifications[currentNotification].discount} de desconto</strong>!
        </p>
      </div>

      <style jsx global>{`
        * {
          margin: 0px;
          padding: 0px;
          box-sizing: border-box;
          font-family: "Montserrat", sans-serif;
          font-optical-sizing: auto;
          font-style: normal;
        }

        .overlay {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        @keyframes spinToRetryThenWin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(2880deg);
          }
        }

        .wheel__spinner_animated_retry_then_win {
          animation: 10s spinToRetryThenWin cubic-bezier(0.1, 0.1, 0.1, 1) 1 forwards;
          transform-origin: center center;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes spinner {
          0% {
            -webkit-transform: rotate(-123deg);
            transform: rotate(-123deg);
            -moz-transform: rotate(-123deg);
          }
          50% {
            -webkit-transform: rotate(-117deg);
            transform: rotate(-117deg);
            -moz-transform: rotate(-117deg);
          }
          100% {
            -webkit-transform: rotate(-123deg);
            transform: rotate(-123deg);
            -moz-transform: rotate(-123deg);
          }
        }

        @keyframes spinToOne {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-1890deg);
          }
        }

        .wheel__spinner_animated {
          animation: 10s spinToOne cubic-bezier(0.1, 0.1, 0.1, 1) 1 forwards;
          transform-origin: center center;
        }

        #roleta1,
        #roleta2 {
          position: absolute;
          left: 50%;
          max-width: 550px;
          top: 50%;
          transform: translate(-50%, -50%);
          transform-origin: center center;
        }

        #roleta2 img {
          width: 100%;
        }

        .spinner {
          animation: spinner 1.5s ease-in-out infinite;
        }

        #roleta3 {
          max-width: 150px;
          z-index: 10;
          padding-left: 16px;
          position: absolute;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .button-roulette {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
          z-index: 1;
        }

        #button-cta {
          z-index: 1;
          width: 30%;
          height: 45px;
          background-color: #ff0000;
          border: none;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 700;
          color: rgb(255, 255, 255);
          box-shadow: 0px 0px 15px 1px #4e5399;
          animation: pulse 1s linear infinite;
        }

        .popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 20px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: block;
          width: 80%;
          border-radius: 10px;
        }

        .popup-content {
          text-align: center;
        }

        .popup h2 {
          font-weight: bold;
          margin: 0;
        }

        .popup p {
          margin: 15px 0;
          font-size: 12pt;
        }

        .popup button {
          z-index: 9999999;
          background-color: #ff0000;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 700;
          color: white;
          box-shadow: 0px 0px 15px 1px #4e5399;
          animation: pulse 1s linear infinite;
          margin-top: 5px;
          padding: 10px 20px;
        }

        .people {
          display: flex;
          justify-content: center;
          align-items: center;
          padding-inline: 10px;
          padding-block: 12px;
          color: rgb(255, 255, 255);
          position: fixed;
          top: 100%;
          transform: translateY(-100%);
          width: 100vw;
          height: 60px;
          gap: 12px;
          background-color: #ff0000;
          border-top: gray 1px solid;
          z-index: 9999;
        }

        .slide-animation {
          animation: slidein 1200ms;
        }

        .people img {
          width: 40px;
          border-radius: 50px;
        }

        .terms-modal {
          max-width: 85%;
          width: 400px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .terms-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 15px;
        }

        .terms-content-simple {
          text-align: left;
          margin: 15px 0;
        }

        .terms-list {
          margin: 15px 0;
        }

        .term-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 0;
          font-size: 13px;
        }

        .warning-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 10px;
          margin: 15px 0;
          font-size: 12px;
        }

        .success-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
        }

        .discount-info {
          text-align: center;
          margin: 15px 0;
        }

        .discount-badge {
          background: linear-gradient(45deg, #00aa00, #00cc00);
          color: white;
          font-size: 24px;
          font-weight: bold;
          padding: 8px 16px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 10px;
        }

        .risk-text {
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 6px;
          border-left: 4px solid #ff0000;
          margin-top: 10px;
          font-size: 13px;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 15px;
        }

        .action-buttons-vertical {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          margin-top: 15px;
        }

        .claim-button {
          background: linear-gradient(45deg, #00aa00, #00cc00);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 14px;
        }

        .risk-button {
          background: linear-gradient(45deg, #ff6600, #ff8800);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 14px;
        }

        .claim-button-small {
          background: linear-gradient(45deg, #00aa00, #00cc00);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 12px;
          width: 150px;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .risk-button-small {
          background: linear-gradient(45deg, #ff6600, #ff8800);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 12px;
          width: 150px;
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .warning-text {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 8px;
          margin-top: 10px;
          font-size: 11px;
          color: #856404;
        }

        #accept-terms-button {
          background: linear-gradient(45deg, #ff0000, #ff4444);
          font-size: 14px;
          padding: 10px 20px;
          margin-top: 15px;
        }

        @media (max-width: 800px) {
          #roleta1,
          #roleta2 {
            max-width: 95%;
            top: 50%;
            left: 50%;
            z-index: -1;
          }

          #roleta2 {
            width: 100%;
            z-index: 1;
          }

          #roleta3 {
            max-width: 30%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          .roulette {
            margin-top: 15px;
            overflow: hidden;
          }

          .button-roulette {
            margin-top: 15px;
          }

          #button-cta {
            width: 70%;
            margin-bottom: 10px;
            margin-top: 10px;
          }

          .popup button {
            margin-bottom: 10px;
            margin-top: 10px;
          }
        }
      `}</style>
    </div>
  )
}
