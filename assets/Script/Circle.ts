// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


const {ccclass, property} = cc._decorator;
  //класс кружка
  @ccclass
  export class Circle extends cc.Component {

      //спрайты кружков
      @property(cc.SpriteFrame)
      sprite: cc.SpriteFrame [] = [];
    
      //спрайты для молнии и т.д
      @property(cc.Prefab)
      circlesTipe: cc.Prefab [] = [];
      @property
      //тип фишки
      CircleTypeColor: typeColorCircle;
      CircleType: tipeCircle=0;
      randomNumber: number;
      inMove: boolean = false;
      onLoad () {
      //тут случайным образом распределяем спрайты при их появление на сцене 
        var sp = this.node.getComponent(cc.Sprite);
        this.randomNumber = Math.floor(Math.random() * Math.floor(this.sprite.length));
        sp.spriteFrame = this.sprite[this.randomNumber];
        this.setColorTipe(this.randomNumber);
      }

      start () {
       
      }

      setTipe(tipe) {
        this.CircleType=tipe;
        if (tipe>0) {
          if (tipe == 4 ) {
            this.setTipTMP(1);
            this.setTipTMP(2);
           } else {
            this.setTipTMP(tipe-1);
          }
        }
      }

      private setTipTMP(tipe){
        var newNode = cc.instantiate(this.circlesTipe[tipe]);
        newNode.setParent(this.node);
        newNode.setContentSize(this.node.getContentSize());
        newNode.setPosition(0,0);
      }
   
      setColorTipe(tipe){
        var sp = this.node.getComponent(cc.Sprite);
        this.CircleTypeColor = tipe;
        sp.spriteFrame = this.sprite[tipe];
      }
     
  } 
  //тип фишки
  enum typeColorCircle {
    blue,
    green,
    orange,
    reed,
    violet,
    yellow,
  }
  enum tipeCircle {
    normal,
    lightningHorizont,
    lightningVertical,
    rainbowBall,
    lightningVerticalAndlightningHorizont
  }
