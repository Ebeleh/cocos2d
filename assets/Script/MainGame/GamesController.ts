
import { GameField } from "./GameField";
const { ccclass, property } = cc._decorator;

@ccclass
export class GameController extends cc.Component {

    @property
    countTypeAndMove: number = 12;

    private allpoints: number = 0;

    @property(cc.Label)
    taskType: cc.Label = null;

    private taskpoints: number = 0;

    @property(cc.Label)
    currentMove: cc.Label = null;

    private movepoints: number = 0;

    @property
    testGame: boolean = true;

    @property(cc.Label)
    textPoint: cc.Label = null;

    @property(GameField)
    gameField: GameField = null;

    onLoad() {

        this.taskpoints = Number(this.taskType.string);
        this.movepoints = Number(this.currentMove.string);

        this.node.on('moveCircleEnd', this.gameField.createOneLineCircles, this.gameField);
        this.node.on('moveCircleEnd', function (event) {
            event.stopPropagation();
        });

        this.node.on('clickOnCellForDestroyCircle', this.gameField.clickDestroyCircleInCell, this.gameField);
        this.node.on('clickOnCellForDestroyCircle', function (event) {
            event.stopPropagation();
        });

        this.node.on('destroyCircles', this.gameField.allCirclesMove, this.gameField);
        this.node.on('destroyCircles', function (event) {
            event.stopPropagation();
        });

        this.node.on('needCheckField', this.gameField.checkLine, this.gameField);
        this.node.on('needCheckField', function (event) {
            event.stopPropagation();
        });

        this.node.on('setPoint', this.setPoint, this);
        this.node.on('setPoint', function (event) {
            event.stopPropagation();
        });


        this.node.on('getDestroyCirclesType', this.gameField.getTypeDestroyCircle, this.gameField);
        this.node.on('getDestroyCirclesType', function (event) {
            event.stopPropagation();
        });

        this.node.on('setDestroyCirclesType', this.setTypeDestroyCircle, this);
        this.node.on('setDestroyCirclesType', function (event) {
            event.stopPropagation();
        });


    }

    private setPoint() {
        this.allpoints += 1;
        this.textPoint.string = this.allpoints.toString();
    }
/*
    setBuster() {
        this.gameField.
    }
*/

    private CheckGameOver() {

    }

    RestartGame() {

        this.gameField.node.active = false;
        this.gameField.node.active = true;

        this.allpoints = 1;
        this.textPoint.string = this.allpoints.toString();
        this.taskType.string = this.countTypeAndMove.toString();
        this.currentMove.string = this.countTypeAndMove.toString();

    }

    setTypeDestroyCircle() {

    }

}