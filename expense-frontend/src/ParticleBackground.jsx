import {useEffect, useRef} from "react"

function ParticleBackground() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const orbs = []
        for (let i = 0; i<6;i++) {
            orbs.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 80 + 40,
                speedX: (Math.random() - 0.5)*0.3,
                speedY: (Math.random() - 0.5)*0.15,
                opacity: Math.random() * 0.15 +0.15,
                color: Math.random() > 0.5 ? "212, 201, 168" : "180, 165, 130"
            })
        }

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

        let gradientAngle = 0

        function animate() { 
            ctx.clearRect (0, 0, canvas.width, canvas.height)
            
            gradientAngle += 0.02
            const gx = canvas.width / 2+ Math.cos(gradientAngle) * 200
            const gy = canvas.height / 2+ Math.sin(gradientAngle) * 200
            const gradient = ctx.createRadialGradient( gx, gy, 0, canvas.width/2, canvas.height/2, canvas.width)
            gradient.addColorStop(0, "#1a1035")
            gradient.addColorStop(0.5, "#0d0d1a")
            gradient.addColorStop(1, "#050510")
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw Orbs

            orbs.forEach( orb => {
                orb.x += orb.speedX
                orb.y += orb.speedY
                if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius
                if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius
                if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius
                if (orb.y > canvas.width + orb.radius) orb.y = -orb.radius

                const orbGradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
                orbGradient.addColorStop(0, `rgba(${orb.color}, ${orb.opacity})`)
                orbGradient.addColorStop(1, `rgba(${orb.color}, 0)`)
                ctx.beginPath()
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
                ctx.fillStyle = orbGradient
                ctx.fill()
            })



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

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight

        }
        window.addEventListener("resize", handleResize)
        return() => window.removeEventListener("resize", handleResize)


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