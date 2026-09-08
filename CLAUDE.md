# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción

Clon del arcade clásico **Asteroids**, implementado en HTML5 Canvas puro (vanilla JS ES6+). Sin dependencias, sin bundler, sin build step. El código está dividido en varios archivos bajo `js/`, cargados como scripts globales clásicos (sin `import`/`export`, sin `type="module"`) para poder seguir abriendo `index.html` con doble clic sin servidor.

## Comandos

No hay build, lint ni tests — es un proyecto estático sin bundler.

- **Ejecutar el juego**: abrir `index.html` directamente en el navegador, o servirlo localmente con `npx serve .` (visitar `http://localhost:3000`).
- No existe suite de tests ni linter configurado en el repo.

## Arquitectura

Todos los archivos comparten un único ámbito global (variables `let`/`const`/`class` de nivel superior son visibles entre archivos), así que **el orden de los `<script>` en `index.html` importa**: cada archivo asume que los anteriores ya se ejecutaron.

- `js/core.js` — `canvas`/`ctx`/`W`/`H` y utilidades puras: `wrap()`, `dist()`, `rand()`, `randInt()`. Debe cargarse primero.
- `js/input.js` — objetos globales `keys` (estado sostenido) y `justPressed` (flanco de subida, consumido vía `pressed(code)`), alimentados por listeners de `keydown`/`keyup`.
- `js/entities/bullet.js`, `js/entities/powerup.js`, `js/entities/asteroid.js`, `js/entities/ship.js`, `js/entities/particle.js` — una clase de entidad por archivo, cada una con `update(dt)` y `draw()` propios. No hay jerarquía compartida ni sistema de entidades genérico — cada clase maneja su propio movimiento y render directamente sobre `ctx`. `powerup.js` debe cargarse antes que `ship.js` (`Ship` referencia `POWERUP_TYPES`/`TRIPLE_SHOT_SPREAD`/`HYPER_THRUST_MULT`), y `bullet.js` antes que `ship.js` (`Ship.tryShoot()` crea `Bullet`s).
- `js/game.js` — estado global de la partida (`ship`, `bullets`, `asteroids`, `powerups`, `score`, `lives`, `level`, `state`, temporizadores de power-ups) y la lógica de `update(dt)`: máquina de estados (`'playing'` | `'dead'` | `'gameover'`), colisiones, spawns. `initGame()` resetea todo; `nextLevel()` se dispara cuando `asteroids.length === 0`.
- `js/render.js` — todo el dibujado por frame: `draw()`, `drawHUD()`, `drawOverlay()`, `drawLifeIcon()`.
- `js/main.js` — el loop principal (`loop()`): usa `requestAnimationFrame`, calcula `dt` en segundos (clamp a 0.05 máx. para evitar saltos), separa estrictamente `update(dt)` de `draw()`, y arranca el juego (`initGame()` + primer frame).

Patrones transversales a tener en cuenta al tocar cualquier archivo:

- **Espacio toroidal**: todas las entidades usan `wrap(v, max)` (de `core.js`) para envolver posición en los bordes del canvas (`W=800`, `H=600`).
- **Colisiones**: por distancia circular simple (`dist()` + suma de radios), evaluadas en `update()` (`game.js`) mediante loops anidados (bala vs asteroide, nave vs power-up, nave vs asteroide). No hay spatial partitioning.
- **Fragmentación de asteroides**: `Asteroid.split()` genera 2 asteroides de tamaño menor (`size - 1`) al ser destruido; tamaño 1 no se fragmenta más. Velocidad, radio y puntos por tamaño están en los arrays paralelos `SPEEDS`, `RADII`, `POINTS` (índices 1–3).
- **Power-ups**: `POWERUP_TYPES` (en `entities/powerup.js`) define tipo → color/duración. Cada tipo cae con probabilidad `POWERUP_DROP_CHANCE` por asteroide destruido, limitado a una vez por nivel vía `powerupDropped[type]` (se resetea en `initGame()`/`nextLevel()`). Los timers de efecto activo (`tripleShotTimer`, `hyperTimer`) viven en `game.js`, se pierden al morir (`killShip()`) y sobreviven al cambio de nivel.
- **Vidas/invencibilidad**: al reaparecer, `ship.invincible` cuenta regresivo bloquea colisiones y produce parpadeo visual (`Ship.draw()` se salta frames según `Math.floor(invincible * 8) % 2`).

`index.html` monta el `<canvas id="canvas">` y carga los scripts de `js/` en el orden descrito arriba; no hay CSS externo ni assets aparte de `favicon.svg`.
