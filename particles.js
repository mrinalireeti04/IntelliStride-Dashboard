const canvas = document.getElementById('magic-mesh-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  setTimeout(resize, 100);

  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.size = Math.random() * 1.5 + 0.5;
      this.speed = Math.random() * 0.4 + 0.1;
      this.angle = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.6 + 0.1;
    }
    update(t) {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
    draw() {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create constellation particles
  for (let i = 0; i < 350; i++) {
    particles.push(new Particle());
  }

  function animate(t) {
    requestAnimationFrame(animate);
    if (!width || !height) resize();
    ctx.clearRect(0, 0, width, height);
    
    // Draw connecting lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for(let i=0; i<particles.length; i++) {
      for(let j=i+1; j<particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        if (dx*dx + dy*dy < 8000) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update(t);
      p.draw();
    });
  }

  requestAnimationFrame(animate);
}
