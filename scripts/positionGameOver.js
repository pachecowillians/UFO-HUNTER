class GameOverPosition {
    constructor() {
    }
    draw() {
        ctx.clearRect(0, 0, play.width, play.height);
        ctx.font = "40px Comic Sans MS";
        ctx.textAlign = "center";
        ctx.fillStyle = '#fff';
        ctx.fillText("Game Over!", play.width / 2, play.height / 2 - 120);
        ctx.font = "36px Comic Sans MS";
        ctx.fillStyle = '#d7df01';
        ctx.fillText("You´ve reached level " + play.level + " and your score is " + play.score + ".", play.width / 2, play.height / 2);
        ctx.font = "36px Comic Sans MS";
        ctx.fillStyle = '#d7df01';
        ctx.fillText("Press 'space' to continue.", play.width / 2, play.height / 2 + 40);
    }
    keyDown(play, keyboardCode) {
        if (keyboardCode == 32) {
            play.goToPosition(new OpeningPosition());
        }
    }
}


