export default class ExplosionSystem {
    constructor(engine) { this.engine = engine; }

    triggerExplosion(x, y) {
        const e = this.engine;
        const ex = e.makeExplosion({ x, y });
        ex.counted = false;
        e.explosions.push(ex);
    }

    advance(dt) {
        const e = this.engine;
        for (const ex of e.explosions) ex.t += dt;
    }

    cull() {
        const e = this.engine;
        for (let i = e.explosions.length - 1; i >= 0; i--) {
            const ex = e.explosions[i];
            if (ex.t >= e.GAME.EXPLOSION_TIME) {
                if (!ex.counted) {
                    ex.counted = true;
                    if (!e.inBossPhase && !e.justReset) {
                        e.killCount++;
                        if (e.onKill) e.onKill({ kills: e.killCount, absolute: true });
                        if (e.killCount >= 10) e.enterBossPhase();
                    }
                }
                e.explosions.splice(i, 1);
            }
        }
    }
}
