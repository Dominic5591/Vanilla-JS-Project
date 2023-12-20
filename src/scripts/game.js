import Player from "./player"
import Bullet from "./bullet"
import RedEnemy from "./redEnemy"
import YellowEnemy from "./yellowEnemy"
class Game {
  constructor() {
    this.canvas = document.getElementById("game-container")
    this.ctx = this.canvas.getContext("2d")
    this.lives = 1
    this.score = 0
    this.moveUp = false
    this.moveDown = false
    this.yellowEnemies = []
    this.redEnemies = []
    this.bullets = []
    this.redEnemyTimeouts = [];
    this.yellowEnemyTimeouts = [];
    this.player = new Player(this.canvas, this.ctx)

    this.bulletSound = new Audio('./assets/sounds/shoot.wav')
    this.bulletSound.volume = 0.1;
    this.bulletSound.loop = false;

    this.enemySound = new Audio('./assets/sounds/hurt.mp3')
    this.enemySound.volume = 0.1;
    this.enemySound.loop = false;

    this.mainMusic = new Audio('./assets/sounds/music.mp3')
    this.mainMusic.volume = 0.1;
    this.mainMusic.loop = true;

    this.playSound = new Audio('./assets/sounds/button.mp3')
    this.playSound.volume = 0.3
    this.playSound.loop = false

    this.respawnSound = new Audio('./assets/sounds/respawn.mp3')
    this.respawnSound.volume = 0.1;
    this.respawnSound.loop = false;

    this.isMuted = false;
    document.addEventListener("keydown", this.handleKeyDown.bind(this))
    document.addEventListener("keyup", this.handleKeyUp.bind(this))

    this.redEnemyDelay = 500;
    this.yellowEnemyDelay = 1000;
    this.createRedEnemy(5)
    this.createYellowEnemy(3)
    this.gamePaused = true;
    this.gameLoop();

    this.paused = false;
    this.gameOverModal = document.getElementById("game-over-modal");

    const muteBtn = document.getElementById("mute")
    muteBtn.addEventListener("click", () => {
      this.muteToggle()
    })

    const startGameBtn = document.getElementById("start-game-btn");
    startGameBtn.addEventListener("click", () => {
      this.playSound.currentTime = 0;
      this.playSound.play()
      this.hideMenu()
    });
  }

  showMenu() {
    const mainMenu = document.getElementById("main-menu");
    mainMenu.style.display = "flex";
    this.pauseGame();
  }
  
  hideMenu() {
    const mainMenu = document.getElementById("main-menu");
    mainMenu.style.display = "none";
    this.resumeGame();
  }
  
  pauseGame() {
    this.gamePaused = true;
  }
  
  resumeGame() {
    this.gamePaused = false;
    this.reset()
    this.gameLoop(); 
  }


  gameOver() {
    this.paused = true;
    this.displayHighScores(); 

    const modal = document.getElementById("game-over-modal");
    const finalScore = document.getElementById("final-score");
    finalScore.textContent = `Final Score: ${this.score}`; 

    modal.style.display = "flex";

    const restartBtn = document.getElementById("restart-btn");
    let restartHandled = false;

    restartBtn.addEventListener("click", () => {
      if (restartHandled) {
        return;
      }
  
      const initialsInput = document.getElementById("initials-input");
      const initials = initialsInput.value.trim();
    
      if (initials !== "" && this.score !== 0) {
        const user = {
          initials: initials,
          score: this.score
        };
    
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    
        highScores.push(user);
        highScores.sort((a, b) => b.score - a.score);
    
        localStorage.setItem("highScores", JSON.stringify(highScores));
      }
      
      initialsInput.value = "";
      this.playSound.currentTime = 0;
      this.playSound.play();
      this.showMenu();
      modal.style.display = "none";
      restartHandled = true;
    });
  }


  displayHighScores() {
    const highScoresContainer = document.getElementById("high-scores");
    highScoresContainer.innerHTML = "abc";

    // get data from local storage
    const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  
    if (highScores.length > 0) {
      const highScoresTitle = document.createElement("h3");
      highScoresTitle.classList.add("score-title")
      highScoresTitle.textContent = "High Scores";
      highScoresTitle.classList.add("score-title")
      highScoresContainer.appendChild(highScoresTitle);
  
      const list = document.createElement("ul");
  
      //  each high score
      highScores.forEach((user, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${user.initials}: ${user.score}`;
        listItem.classList.add("high-score-entry"); 
        list.appendChild(listItem);
      });
  
      highScoresContainer.appendChild(list);
    } else {
      const noScoresMessage = document.createElement("p");
      noScoresMessage.textContent = "No high scores!";
      noScoresMessage.classList.add("no-score")
      highScoresContainer.appendChild(noScoresMessage);
    }
  }

  muteToggle() {
    this.isMuted = !this.isMuted

    this.bulletSound.muted = this.isMuted
    this.enemySound.muted = this.isMuted
    this.mainMusic.muted = this.isMuted
    this.playSound.muted = this.isMuted
    this.respawnSound.muted = this.isMuted
  }

  createRedEnemy(num) {
    for (let i = 0; i < num; i++) {
      setTimeout(() => {
        this.redEnemies.push(new RedEnemy(this.canvas, this.ctx))
      }, i * this.redEnemyDelay)
    }
  }

  createYellowEnemy(num) {
    for (let i = 0; i < num; i++) {
      setTimeout(() => {
        this.yellowEnemies.push(new YellowEnemy(this.canvas, this.ctx))
      }, i * this.yellowEnemyDelay)
    }
  }

  reset() {
    this.paused = false;
    this.gamePaused = false
    this.redEnemies.length = 0
    this.yellowEnemies.length = 0
    this.score = 0
    this.lives = 3
    this.createRedEnemy(6)
    this.createYellowEnemy(4)
  }

  shoot() {
    if (!this.bulletSound.paused) {
      this.bulletSound.pause();
      this.bulletSound.currentTime = 0;
    }

    let bullet = new Bullet(this.player)
    this.bulletSound.play();
    this.bullets.push(bullet)
  }

  updateScore() {
    let score = document.getElementById('score')
    score.textContent = `Score: ${this.score}`
  }

  updateLives() {
    let lives = document.getElementById('lives')
    lives.textContent = `Lives: ${this.lives}`
  } 

  updateBullets() {
    this.bullets.forEach((bullet, bulletIdx) => {
      bullet.draw(this.ctx);
      bullet.x += bullet.speed;

      this.bulletRedCollisions(bullet, bulletIdx)
    });
  }

  gameLoop() {
    if (!this.gamePaused && !this.paused) {
      this.mainMusic.play()
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.updateRed();
      this.updateYellow();
      this.updateBullets();
      this.updatePlayer();
      this.updateScore();
      this.updateLives();
    }
    
    if (!this.gamePaused && !this.paused) {
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }


  updateRed() {
    this.redEnemies.forEach((red) => {
      red.move()
      red.draw()
      this.RedCollision(red)
      this.redWrap(red)
    });
  }

  updateYellow() { 
    this.yellowEnemies.forEach((yellow) => {
      yellow.move()
      yellow.draw()
      this.yellowCollision(yellow)
      this.bulletYellowCollisions(yellow)
      this.yellowWrap(yellow)
    });
  }

  updatePlayer() {
    this.player.draw();
    this.player.handleMovement(this.moveUp, this.moveDown, this.canvas)
    if (!this.player.shield) {
      this.player.draw()
      this.player.handleMovement(this.moveUp, this.moveDown, this.canvas)
    }
  }
  RedCollision(red) {
    const distance = Math.hypot(red.x - this.player.x, red.y - this.player.y)
    if (!this.player.shield && distance < red.radius + this.player.radius) {
      this.lives--;
      if (this.lives > 0) {
        this.respawnSound.play()
        this.player.respawn()
        this.player.y = this.canvas.height / 2
      } else {
        this.mainMusic.pause()
        this.mainMusic.currentTime = 0;
        this.enemySound.play()
        this.gameOver()
      }
    }
  }

  yellowCollision(yellow) {
    const distance = Math.hypot(yellow.x - this.player.x, yellow.y - this.player.y)
    if (!this.player.shield && distance < yellow.width && !yellow.marked) {
      this.lives--;
      if (this.lives > 0) {
        this.respawnSound.play()
        this.player.respawn()
        this.player.y = this.canvas.height / 2;
      } else {
        this.mainMusic.pause()
        this.mainMusic.currentTime = 0;
        this.enemySound.play()
        this.gameOver()
      }
    }
  }

  bulletYellowCollisions(yellow) {
    this.bullets.forEach((bullet, bulletIdx) => {
      if (
        bullet.x < yellow.x + yellow.width &&
        bullet.x + bullet.width > yellow.x &&
        bullet.y < yellow.y + yellow.height &&
        bullet.y + bullet.height > yellow.y
      ) {
        this.bullets.splice(bulletIdx, 1)
        yellow.takeDamage()

        if (yellow.marked) {
          this.yellowEnemies.splice(this.yellowEnemies.indexOf(yellow), 1)
          if (!this.enemySound.paused) {
            this.enemySound.pause();
            this.enemySound.currentTime = 0;
          }
          this.enemySound.play()
          this.score += 300
          this.createYellowEnemy(1)
          this.updateScore()
        }
      }
    });
  }

  bulletRedCollisions(bullet, bulletIdx) {
    this.redEnemies.forEach((red, redIndex) => {
      if (bullet.x < red.x + red.radius && bullet.x + bullet.width > red.x - red.radius &&
        bullet.y < red.y + red.radius && bullet.y + bullet.height > red.y - red.radius
      ) {
        this.bullets.splice(bulletIdx, 1)
        this.redEnemies.splice(redIndex, 1)
        if (!this.enemySound.paused) {
          this.enemySound.pause();
          this.enemySound.currentTime = 0;
        }
        this.enemySound.play()
        this.score += 100
        this.createRedEnemy(1)
        this.updateScore()
      }
    });
  }

  redWrap(red) {  
    if (red.x - red.radius < 0) red.x = this.canvas.width + red.radius
    if (red.y - red.radius < 0 || red.y + red.radius > this.canvas.height) {
      red.y = Math.random() * (this.canvas.height - 2 * red.radius) + red.radius
    }
  }
  yellowWrap(yellow) {
    if (yellow.x - yellow.radius < 0) yellow.x = this.canvas.width + yellow.radius
    
    if (yellow.y - yellow.radius < 0 || yellow.y + yellow.radius > this.canvas.height) {
      yellow.y = Math.random() * (this.canvas.height - 2 * yellow.radius) + yellow.radius
    }
  }

  handleKeyUp(e) {
    switch (e.code) {
      case "ArrowUp": this.moveUp = false
        break;
      case "ArrowDown": this.moveDown = false
        break;
    }
  }
  handleKeyDown(e) {
    switch (e.code) {
      case "ArrowUp": this.moveUp = true
        break;
      case "ArrowDown": this.moveDown = true
        break;
      case "Space": this.shoot()
        break;
    }
  }
}
export default Game;