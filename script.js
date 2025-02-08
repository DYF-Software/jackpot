let reels = [];
let spinning = false;

const config = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  backgroundColor: '#000',
  parent: 'game-container',
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('machine', 'assets/machine.png');
  this.load.image('cherries', 'assets/cherries.png');
  this.load.image('lemon', 'assets/lemon.png');
  this.load.image('orange', 'assets/orange.png');
}

function create() {
  const machine = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'machine').setScale(0.8);
  
  let symbols = ['cherries', 'lemon', 'orange'];

  reels = [];
  for (let i = 0; i < 3; i++) {
    let randomSymbol = Phaser.Math.RND.pick(symbols);
    let reel = this.add.image(this.cameras.main.centerX - 80 + i * 75, this.cameras.main.centerY + 30, randomSymbol).setScale(0.1);
    reel.setOrigin(0.5);
    reels.push(reel);
  }

  this.startText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 50, 'Click to start game', {
    fontSize: '24px',
    fill: '#fff'
  }).setOrigin(0.5);

  this.input.on('pointerdown', () => {
    if (!spinning) {
      if (this.startText) {
        this.startText.destroy();
        this.startText = null;
      }
      spinReels.call(this);
    }
  });
}

function update() {}

function runTweenChain(scene, reel, tweensArray, onComplete) {
  let index = 0;
  function nextTween() {
    if (index >= tweensArray.length) {
      if (onComplete) {
        onComplete();
      }
      return;
    }
    let tweenConfig = tweensArray[index];
    index++;
    let config = Object.assign({}, tweenConfig);
    config.targets = reel;
    let originalOnComplete = config.onComplete;
    config.onComplete = () => {
      if (originalOnComplete) {
        originalOnComplete();
      }
      nextTween();
    };
    scene.tweens.add(config);
  }
  nextTween();
}

function spinReels() {
  spinning = true;
  let completedReels = 0;
  let symbols = ['cherries', 'lemon', 'orange'];

  reels.forEach((reel, index) => {
    this.time.delayedCall(index * 100, () => {
      let tweensArray = [];
      let originalY = reel.y;
      let moveAmount = 15

      for (let cycle = 0; cycle < 9; cycle++) {
        tweensArray.push({
          y: originalY - moveAmount,
          ease: 'Quad.easeOut',
          duration: 100,
          onComplete: () => {
            reel.setTexture(Phaser.Math.RND.pick(symbols));
          }
        });
        tweensArray.push({
          y: originalY + moveAmount,
          ease: 'Quad.easeIn',
          duration: 100
        });
      }

      tweensArray.push({
        y: originalY - moveAmount,
        ease: 'Quad.easeOut',
        duration: 100,
        onComplete: () => {
          reel.setTexture('cherries');
        }
      });
      tweensArray.push({
        y: originalY,
        ease: 'Quad.easeIn',
        duration: 100
      });

      runTweenChain(this, reel, tweensArray, () => {
        completedReels++;
        if (completedReels === reels.length) {
          spinning = false;
          this.add.text(this.cameras.main.centerX, 50, 'You Win!', {
            fontSize: '32px',
            fill: '#0f0'
          }).setOrigin(0.5);
        }
      });
    });
  });
}
