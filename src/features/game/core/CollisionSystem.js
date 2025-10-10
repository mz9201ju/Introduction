export default class CollisionSystem {
    constructor(engine) { this.engine = engine; }

    handleCollisions() {
        const e = this.engine;
        for (const pb of e.myBullets) {
            if (pb.life <= 0) continue;
            for (const en of e.enemies) {
                if (!en.alive) continue;
                const dx = en.x - pb.x, dy = en.y - pb.y;
                if (dx * dx + dy * dy <= e.GAME.HIT_RADIUS * e.GAME.HIT_RADIUS) {
                    en.alive = false;
                    pb.life = 0;
                    e.triggerExplosion(en.x, en.y);
                    break;
                }
            }
        }
    }
}
