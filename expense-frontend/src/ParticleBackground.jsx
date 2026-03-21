import {useEffect, useRef} from "react"

function ParticleBackground() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const particles = []

        for (let i=0; i<100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2+0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() *0.5 +0.1

            })
        }

        function animate() { 
            ctx.clearRect (0, 0, canvas.width, canvas.height)
            particles.forEach(p => {
                p.x += p.speedX
                p.y += p.speedY
                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(155, 143, 196 , ${p.opacity})`
                ctx.fill()
            })
            requestAnimationFrame(animate)
        }

        animate()
    }, [])
    return(
        <canvas
        ref={canvasRef}
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: -1,
            pointerEvents: "none"
        }}
        />
    )
} export default ParticleBackground