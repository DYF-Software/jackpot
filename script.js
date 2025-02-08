let reels = [];
let spinning = false;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000',
  parent: 'game-container',
  scene: {
    preload: preload,
    create: create,
    update: update,
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
  this.add.image(400, 300, 'machine').setScale(0.8);

  let symbols = ['cherries', 'lemon', 'orange'];

  reels = [];
  for (let i = 0; i < 3; i++) {
    let randomSymbol = Phaser.Math.RND.pick(symbols);
    let reel = this.add.image(325 + i * 70, 330, randomSymbol).setScale(0.1);
    reels.push(reel);
  }

  this.startText = this.add.text(400, 550, 'Click to start game', {
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
      for (let cycle = 0; cycle < 9; cycle++) {
        tweensArray.push({
          y: 320,
          ease: 'Quad.easeOut',
          duration: 80,
          onComplete: () => {
            reel.setTexture(Phaser.Math.RND.pick(symbols));
          }
        });
        tweensArray.push({
          y: 330,
          ease: 'Quad.easeIn',
          duration: 80
        });
      }
      tweensArray.push({
        y: 320,
        ease: 'Quad.easeOut',
        duration: 80,
        onComplete: () => {
          reel.setTexture('cherries');
        }
      });
      tweensArray.push({
        y: 330,
        ease: 'Quad.easeIn',
        duration: 80
      });

      runTweenChain(this, reel, tweensArray, () => {
        completedReels++;
        if (completedReels === reels.length) {
          spinning = false;
          this.add.text(400, 50, 'You Win!', {
            fontSize: '32px',
            fill: '#0f0'
          }).setOrigin(0.5);
        }
      });
    });
  });
}
