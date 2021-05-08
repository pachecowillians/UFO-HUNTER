class InGamePosition {
    constructor(settings, level) {
        this.settings = settings;
        this.level = level;
        this.upSec = this.settings.updateSeconds;
        this.spaceshipSpeed = this.settings.spaceshipSpeed;
        this.object = null;
        this.spaceship = null;
        this.bullets = [];
        this.lastBulletTime = null;
        this.ufos = [];
        this.bombs = [];
    }
    update(play) {
        const spaceship = this.spaceship;
        const spaceshipSpeed = this.spaceshipSpeed;
        const upSec = this.settings.updateSeconds;
        const bullets = this.bullets;
        if (play.pressedKeys[37]) {
            this.spaceship.x -= this.spaceshipSpeed * this.upSec;
        }
        if (play.pressedKeys[39]) {
            this.spaceship.x += this.spaceshipSpeed * this.upSec;
        }
        if (play.pressedKeys[32]) {
            this.shoot();
        }
        if (this.spaceship.x < play.playBoundaries.left) {
            this.spaceship.x = play.playBoundaries.left;
        }
        if (this.spaceship.x > play.playBoundaries.right) {
            this.spaceship.x = play.playBoundaries.right;
        }
        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];
            bullet.y -= upSec * this.settings.bulletSpeed;
            if (bullet.y < 0) {
                bullets.splice(i--, 1);
            }
        }
        let reachedSide = false;
        for (let i = 0; i < this.ufos.length; i++) {
            const ufo = this.ufos[i];
            let fresh_x = ufo.x + this.ufoSpeed * upSec * this.turnAround * this.horizontalMoving;
            let fresh_y = ufo.y + this.ufoSpeed * upSec * this.verticalMoving;
            if (fresh_x > play.playBoundaries.right || fresh_x < play.playBoundaries.left) {
                this.turnAround *= -1;
                reachedSide = true;
                this.horizontalMoving = 0;
                this.verticalMoving = 1;
                this.ufosAreSinking = true;
            }
            if (reachedSide !== true) {
                ufo.x = fresh_x;
                ufo.y = fresh_y;
            }
        }
        if (this.ufosAreSinking == true) {
            this.ufoPresentSinkingValue += this.ufoSpeed * upSec;
            if (this.ufoPresentSinkingValue >= this.settings.ufoSinkingValue) {
                this.ufosAreSinking = false;
                this.verticalMoving = 0;
                this.horizontalMoving = 1;
                this.ufoPresentSinkingValue = 0;
            }
        }
        const frontLineUFOs = [];
        for (let i = 0; i < this.ufos.length; i++) {
            let ufo = this.ufos[i];
            if (!frontLineUFOs[ufo.column] || frontLineUFOs[ufo.column].line < ufo.line) {
                frontLineUFOs[ufo.column] = ufo;
            }
        }
        for (let i = 0; i < this.settings.ufoColumns; i++) {
            let ufo = frontLineUFOs[i];
            if (!ufo)
            continue;
            let chance = this.bombFrequency * upSec;
            this.object = new Objects();
            if (chance > Math.random()) {
                this.bombs.push(this.object.bomb(ufo.x, ufo.y + ufo.height / 2));
            }
        }
        for (let i = 0; i < this.bombs.length; i++) {
            const bomb = this.bombs[i];
            bomb.y += upSec * this.bombSpeed;
            if (bomb.y > this.height) {
                this.bombs.splice(i--, 1);
            }
        }
        //UFO-BULLET
        for (let i = 0; i < this.ufos.length; i++) {
            let ufo = this.ufos[i];
            let collision = false;
            for (let j = 0; j < bullets.length; j++) {
                let bullet = bullets[j];
                if (bullet.x >= (ufo.x - ufo.width / 2) && bullet.x <= (ufo.x + ufo.width / 2) &&
                bullet.y >= (ufo.y - ufo.height / 2) && bullet.y <= (ufo.y + ufo.height / 2)) {
                    bullets.splice(j--, 1);
                    collision = true;
                    play.score += this.settings.pointsPerUFO;
                }
            }
            if (collision == true) {
                this.ufos.splice(i--, 1);
                play.sounds.playSound('ufoDeath');
            }
        }
        //SPACESHIP-BOMB
        for (let i = 0; i < this.bombs.length; i++) {
            let bomb = this.bombs[i];
            if (bomb.x + 2 >= (spaceship.x - spaceship.width / 2) &&
            bomb.x - 2 <= (spaceship.x + spaceship.width / 2) &&
            bomb.y + 6 >= (spaceship.y - spaceship.height / 2) &&
            bomb.y <= (spaceship.y + spaceship.height / 2)) {
                this.bombs.splice(i--, 1);
                play.sounds.playSound('explosion');
                play.shields--;
            }
        }
        //UFO-SPACESHIP
        for (let i = 0; i < this.ufos.length; i++) {
            let ufo = this.ufos[i];
            if ((ufo.x + ufo.width / 2) > (spaceship.x - spaceship.width / 2) &&
            (ufo.x - ufo.width / 2) < (spaceship.x + spaceship.width / 2) &&
            (ufo.y + ufo.height / 2) > (spaceship.y - spaceship.height / 2) &&
            (ufo.y - ufo.height / 2) < (spaceship.y + spaceship.height / 2)) {
                play.sounds.playSound('explosion');
                play.shields = -1;
            }
        }
        if (play.shields < 0) {
            play.goToPosition(new GameOverPosition());
        }
        if (this.ufos.length == 0) {
            play.level += 1;
            play.goToPosition(new TransferPosition(play.level));
        }
    }
    shoot() {
        if (this.lastBulletTime === null || ((new Date()).getTime() - this.lastBulletTime) > (this.settings.bulletMaxFrequency)) {
            this.object = new Objects();
            this.bullets.push(this.object.bullet(this.spaceship.x, this.spaceship.y - this.spaceship.height / 2, this.settings.bulletSpeed));
            this.lastBulletTime = (new Date()).getTime();
            play.sounds.playSound('shot');
        }
    }
    entry(play) {
        this.horizontalMoving = 1;
        this.verticalMoving = 0;
        this.ufosAreSinking = false;
        this.ufoPresentSinkingValue = 0;
        this.turnAround = 1;
        this.ufo_image = new Image();
        this.spaceship_image = new Image();
        this.object = new Objects();
        this.spaceship = this.object.spaceship((play.width / 2), play.playBoundaries.bottom, this.spaceship_image);
        let presentLevel = this.level < 11 ? this.level : 10;
        this.ufoSpeed = this.settings.ufoSpeed + (presentLevel * 7);
        this.bombSpeed = this.settings.bombSpeed + (presentLevel * 10);
        this.bombFrequency = this.settings.bombFrequency + (presentLevel * 0.05);
        const lines = this.settings.ufoLines;
        const columns = this.settings.ufoColumns;
        const ufosInitial = [];
        let line, column;
        for (let line = 0; line < lines; line++) {
            for (let column = 0; column < columns; column++) {
                this.object = new Objects();
                let x, y;
                x = (play.width / 2) + (column * 50) - ((columns - 1) * 25);
                y = (play.playBoundaries.top + 30) + (line * 30);
                ufosInitial.push(this.object.ufo(x, y, line, column, this.ufo_image));
            }
        }
        this.ufos = ufosInitial;
    }
    keyDown(play, keyboardCode) {
        if (keyboardCode == 83) {
            play.sounds.mute();
        }
        if (keyboardCode == 80) {
            play.pushPosition(new PausePosition());
        }
    }
    draw(play) {
        ctx.clearRect(0, 0, play.width, play.height);
        ctx.drawImage(this.spaceship_image, this.spaceship.x - (this.spaceship.width / 2), this.spaceship.y - (this.spaceship.height / 2));
        ctx.fillStyle = "#ff0000";
        for (let i = 0; i < this.bullets.length; i++) {
            let bullet = this.bullets[i];
            ctx.fillRect(bullet.x - 2, bullet.y - 6, 2, 6);
        }
        for (let i = 0; i < this.ufos.length; i++) {
            let ufo = this.ufos[i];
            ctx.drawImage(this.ufo_image, ufo.x - (ufo.width / 2), ufo.y - (ufo.height / 2));
        }
        ctx.fillStyle = "#fe2ef7";
        for (let i = 0; i < this.bombs.length; i++) {
            let bomb = this.bombs[i];
            ctx.fillRect(bomb.x - 2, bomb.y - 6, 4, 6);
        }
        ctx.font = "16px Comic Sans MS";
        ctx.fillStyle = "#424242";
        ctx.textAlign = "left";
        ctx.fillText("Press S to switch sound effects ON/OFF. Sound:", play.playBoundaries.left, play.playBoundaries.bottom + 70);
        let soundStatus = (play.sounds.muted == true) ? "OFF" : "ON";
        ctx.fillStyle = (play.sounds.muted == true) ? "#f00" : "0b6121";
        ctx.fillText(soundStatus, play.playBoundaries.left + 315, play.playBoundaries.bottom + 70);
        ctx.fillStyle = "#424242";
        ctx.textAlign = "right";
        ctx.fillText("Press P to Pause.", play.playBoundaries.right, play.playBoundaries.bottom + 70);
        ctx.textAlign = "center";
        ctx.fillStyle = "#bdbdbd";
        ctx.font = "bold 24px Comic Sans MS";
        ctx.fillText("Score", play.playBoundaries.right, play.playBoundaries.top - 75);
        ctx.font = "bold 30px Comic Sans MS";
        ctx.fillText(play.score, play.playBoundaries.right, play.playBoundaries.top - 25);
        ctx.font = "bold 24px Comic Sans MS";
        ctx.fillText("Level", play.playBoundaries.left, play.playBoundaries.top - 75);
        ctx.font = "bold 30px Comic Sans MS";
        ctx.fillText(play.level, play.playBoundaries.left, play.playBoundaries.top - 25);
        ctx.textAlign = "center";
        if (play.shields > 0) {
            ctx.fillStyle = "#bdbdbd";
            ctx.font = "bold 24px Comic Sans MS";
            ctx.fillText("Shields", play.width / 2, play.playBoundaries.top - 75);
            ctx.font = "bold 30px Comic Sans MS";
            ctx.fillText(play.shields, play.width / 2, play.playBoundaries.top - 25);
        }
        else {
            ctx.fillStyle = "#ff4d4d";
            ctx.font = "bold 24px Comic Sans MS";
            ctx.fillText("WARNING", play.width / 2, play.playBoundaries.top - 75);
            ctx.fillStyle = "#bdbdbd";
            ctx.font = "bold 30px Comic Sans MS";
            ctx.fillText("No shields left!", play.width / 2, play.playBoundaries.top - 25);
        }
    }
}
