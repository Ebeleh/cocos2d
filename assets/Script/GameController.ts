// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import GameField from "./GameField";
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameController extends cc.Component {

    //Contoller
    //игровой контроллер, который будет управлять полем, выводить очки и прочую чепуху


    @property
    countTypeAndMove:number=12;
    //тут игровые поинты 
    allpoints:number=0;

    //сколько нужно уничтожить шариков
    @property(cc.Label)
    taskType: cc.Label = null;
    taskpoints:number=0;
    
    //сколько ходов
    @property(cc.Label)
    currentMove: cc.Label = null;
    movepoints:number=0;
    //тестовая игра
    @property
    testGame:boolean = true;
    //текст очков
    @property(cc.Label)
    textPoint: cc.Label = null;
  
    @property(GameField)
    gameField: GameField = null;

    onLoad () {

        this.taskpoints = Number(this.taskType.string);
        this.movepoints = Number(this.currentMove.string);

        //подписка на окончание анимации
        this.node.on('moveCircleEnd', this.gameField.createOneLineCircles, this.gameField);
        //подписка на событие уничтожения шарикa
        this.node.on('clickOnCellForDestroyCircle', this.gameField.clickDestroyCircleInCell, this.gameField);
         //подписка на событие уничтожения шариков
        this.node.on('destroyCircles', this.gameField.allCirclesMove, this.gameField);
        //подписка на необходимость проверки поля после заполнения клетками
        this.node.on('needCheckField', this.gameField.checkLine, this.gameField);
        //подписка на событие уничтожения 3 в ряд
        this.node.on('setPoint', this.setPoint, this);
        
    }

    setPoint() {
        this.allpoints+=1;
        this.textPoint.string = this.allpoints.toString();
    }


    CheckGameOver() {

    }

    RestartGame(){
        this.gameField.node.active=false;
        this.gameField.node.active=true;
      
        this.allpoints= 1;
        this.textPoint.string = this.allpoints.toString();
        this.taskType.string = this.countTypeAndMove.toString();
        this.currentMove.string = this.countTypeAndMove.toString();
    }

}
