const canvas = document.getElementById('ufoCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 750;

function resize(){
    const height = window.innerHeight -40;
    
    const ratio = canvas.width /canvas.height;
    const width = height*ratio;
    canvas.style.width = width+'px'; 
    canvas.style.height = height+'px'; 
}

window.addEventListener('load', resize, false);
window.addEventListener('resize', resize);


//Game Basics
class GameBasics {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.playBoundaries = {
            top: 150,
            bottom: 650,
            left: 100,
            right: 800
        };
        this.level = 10;
        this.score = 0;
        this.shields = 2;
        this.setting = {
            updateSeconds: (1 / 60),
            spaceshipSpeed: 200,
            bulletSpeed: 130,
            bulletMaxFrequency: 500,
            ufoLines: 4,
            ufoColumns: 8,
            ufoSpeed: 35,
            ufoSinkingValue: 30,
            bombSpeed: 75,
            bombFrequency: 0.05,
            pointsPerUFO: 25,
        };
        this.positionContainer = [];
        this.pressedKeys = {};
    }
    presentPosition() {
        return this.positionContainer.length > 0 ? this.positionContainer[this.positionContainer.length - 1] : null;
    }
    goToPosition(position) {
        if (this.presentPosition()) {
            this.positionContainer.length = 0;
        }
        if (position.entry) {
            position.entry(play);
        }
        this.positionContainer.push(position);
    }
    pushPosition(posistion) {
        this.positionContainer.push(posistion);
    }
    popPosition() {
        this.positionContainer.pop();
    }
    start() {
        setInterval(function () { GameLoop(play); }, this.setting.updateSeconds * 1000);
        this.goToPosition(new OpeningPosition());
    }
    keyDown(keyboardCode) {
        this.pressedKeys[keyboardCode] = true;
        if (this.presentPosition() && this.presentPosition().keyDown) {
            this.presentPosition().keyDown(this, keyboardCode);
        }
    }
    keyUp(keyboardCode) {
        delete this.pressedKeys[keyboardCode];
    }
}

function GameLoop(play){
    
    let presentPosition = play.presentPosition();
    if (presentPosition) {
        if(presentPosition.update){
            presentPosition.update(play);
        }
        if(presentPosition.draw){
            presentPosition.draw(play);
        }
    }
}

window.addEventListener("keydown", function(e){
    const keyboardCode = e.which || e.keyCode;
    if(keyboardCode == 37 || keyboardCode == 39 || keyboardCode == 32 ){e.preventDefault();}
    play.keyDown(keyboardCode);
});

window.addEventListener("keyup", function(e){
    const keyboardCode = e.which || e.keyCode;
    
    play.keyUp(keyboardCode);
});

const play = new GameBasics(canvas);
play.sounds = new Sounds();
play.sounds.init();
play.start();