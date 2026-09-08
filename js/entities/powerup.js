'use strict';

// ── PowerUps ──────────────────────────────────────────────────────────────────
const TRIPLE_SHOT_SPREAD  = 0.20; // rad entre balas del abanico
const HYPER_THRUST_MULT   = 2.4;  // multiplica empuje (y, vía DRAG, la vel. máx.)
const POWERUP_DROP_CHANCE = 0.15; // prob. por asteroide destruido, por tipo

const POWERUP_TYPES = {
  triple: { color: '#0ff', duration: 10 },
  hyper:  { color: '#f0f', duration: 8  },
};

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type  = type;
    this.color = POWERUP_TYPES[type].color;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(20, 50);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 13;
    this.rot = 0;
    this.rotSpeed = 1.4;
    this.life = 12;
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo en los últimos 3 segundos antes de caducar
    if (this.ttl < 3 && Math.floor(this.ttl * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = this.color;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Hexágono contenedor
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const px = Math.cos(a) * this.radius;
      const py = Math.sin(a) * this.radius;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Icono interior según el tipo de power-up
    ctx.beginPath();
    switch (this.type) {
      case 'triple':
        // Abanico de 3 balas
        [-TRIPLE_SHOT_SPREAD * 2, 0, TRIPLE_SHOT_SPREAD * 2].forEach(off => {
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(off) * this.radius * 0.6, Math.sin(off) * this.radius * 0.6);
        });
        break;
      case 'hyper':
        // Dos galones apuntando a la derecha (velocidad)
        [-4, 4].forEach(dy => {
          ctx.moveTo(-this.radius * 0.5, dy - 3);
          ctx.lineTo(this.radius * 0.1, dy);
          ctx.lineTo(-this.radius * 0.5, dy + 3);
        });
        break;
    }
    ctx.stroke();

    ctx.restore();
  }
}
