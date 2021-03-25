import { Circle } from "./Circle";
import { Cell } from "./Cell";
import { CheckerBoolean } from "./ClassHelpers";
import { tipeCircle } from "./CircleEnums";
import { typeColorCircle } from "./CircleEnums";

const { ccclass, property } = cc._decorator;

@ccclass
export class GameField extends cc.Component {

  @property(cc.Prefab)
  private Circle: cc.Prefab = null;

  @property(cc.Prefab)
  private Cell: cc.Prefab = null;

  @property
  private needRandomVoidCell: boolean = true;
  @property
  private ChangeForCreateAnActiveCell: number = 25;

  @property
  private iter: number = 0.1;

  @property
  private StartCellPosX: number = -150;
  @property
  private StartCellPosY: number = 250;

  @property
  private lenghtCell: number = 62;
  @property
  private widthCell: number = 62;

  private countCircle: number = 0;
  private previousCountCircle: number = 0;

  busterClick: boolean = false;

  private Cells: Cell[][] = [
    [, , , , , , , ,],
    [, , , , , , , ,],
    [, , , , , , , ,],
    [, , , , , , , ,],
    [, , , , , , , ,],
    [, , , , , , , ,],
    [, , , , , , , ,],
    [, , , , , , , ,],
  ];

  destroyTipeColors: number[];

  private currentI_cell_click: number = 0;
  private currentJ_cell_click: number = 0;

  onLoad() {
    this.node.on('wasClickOnCell', this.workWithClickedCell, this);
  }

  workWithClickedCell() {
    for (var j = 0; j < this.Cells.length; j++)
      for (var i = 0; i < this.Cells[j].length; i++)
        if (this.Cells[j][i].wasClick && this.Cells[j][i].wasSelectCircle) {
          this.Cells[j][i].wasClick = false;
          this.Cells[j][i].wasSelectCircle = false;
          this.Cells[j][i].selectCircle();
          cc.log("double click");
          return;
        }
    for (var j = 0; j < this.Cells.length; j++)
      for (var i = 0; i < this.Cells[j].length; i++) {
        if (this.Cells[j][i].wasSelectCircle) {
          this.Cells[j][i].wasSelectCircle = false;
          this.Cells[j][i].selectCircle();
        }
      }
    var cell = this.getClickCell();
    if (cell != null) cell.selectCircle();
  }

  setBuster() {
    cc.log("Buster Set");
    this.busterClick = true;
  }

  private buster() {
    var cell = this.getClickCell();
    cc.log(cell);
    this.animateDestroyCircle(cell);
  }

  onEnable() {

    this.createCells();
    this.setTypeCellsOnIandJ(4, 0, this.Cells.length, 4, 1);
    this.CreateCircles();

    this.destroyTipeColors = new Array(Object.keys(typeColorCircle).length);
    for (var i = 0; i < this.destroyTipeColors.length; i++) this.destroyTipeColors[i] = 0;

  }

  onDisable() {
    this.DestroyCircles();
  }

  start() {
    this.createCells();
    this.setTypeCellsOnIandJ(4, 0, this.Cells.length, 4, 1);
    this.CreateCircles();
  }

  clickDestroyCircleInCell() {
    this.countCircle--;
    this.node.dispatchEvent(new cc.Event.EventCustom('setPoint', true));
    this.allCirclesMove();
  }

  createOneLineCircles() {
    for (var i = 0; i < this.Cells[0].length; i++) {
      this.createCircle(this.Cells[0][i]);
    }
    this.needCheckField();
  }

  private needCheckField() {
    if (!this.fieldOnFilledWithCircles()) {
      this.allCirclesMove();
    } else this.node.dispatchEvent(new cc.Event.EventCustom('needCheckField', true));

  }

  checkLine() {
    this.InArow();
    cc.log("fied fullness");
  }


  private createCells() {

    var xPos: number = 0;
    var yPos: number = 0;
    var _cell;

    for (var j = 0; j < this.Cells.length; j++) {
      for (var i = 0; i < this.Cells[j].length; i++) {
        _cell = cc.instantiate(this.Cell);
        _cell.setContentSize(this.lenghtCell, this.widthCell);
        _cell.setParent(this.node);
        _cell.setPosition(this.StartCellPosX + xPos, this.StartCellPosY + yPos);
        this.Cells[j][i] = _cell.getComponent(Cell);
        if (i % 2 != 0 && j % 2 == 0) { this.Cells[j][i].setAnyColor(); }
        if (i % 2 == 0 && j % 2 != 0) { this.Cells[j][i].setAnyColor(); }
        if (this.needRandomVoidCell) this.createAnyTypeCell(this.Cells[j][i], 1);
        this.Cells[j][i].jcolumn = j;
        this.Cells[j][i].irow = i;
        xPos = xPos + this.lenghtCell;
      }
      xPos = 0;
      yPos = yPos - this.widthCell;
    }

  }

  private createAnyTypeCell(Cell, type) {
    if (Math.floor((Math.random() * this.ChangeForCreateAnActiveCell) + 1) == 1) {
      Cell.typeCell = type;
      Cell.setColorInType();
    }
  }

  private setTypeCellsOnIandJ(i_, j_, iLength, jLegth, type) {
    for (var j = j_; j < jLegth; j++) {
      for (var i = i_; i < iLength; i++) {
        this.Cells[j][i].typeCell = type;
        this.Cells[j][i].setColorInType();
      }
    }
  }

  private CreateCircles() {
    for (var j = 0; j < this.Cells.length; j++)
      for (var i = 0; i < this.Cells[j].length; i++) {
        if (this.Cells[j][i].typeCell == 0) this.createCircle(this.Cells[j][i]);
      }
    this.node.dispatchEvent(new cc.Event.EventCustom('needCheckField', true));

  }

  private DestroyCircles() {
    for (var j = 0; j < this.Cells.length; j++)
      for (var i = 0; i < this.Cells[j].length; i++) {
        if (this.Cells[j][i].circleIsNotNull()) {
          this.Cells[j][i]._circle.destroy();
          this.Cells[j][i]._circle = null;
        }
      }
  }

  private createCircle(Cell) {
    if (!Cell.circleIsNotNull() && Cell.typeCell == 0) {
      Cell._circle = cc.instantiate(this.Circle);
      Cell._circle.setParent(this.node);
      Cell._circle.setPosition(Cell.node.position);
      Cell._circle.setContentSize(this.lenghtCell - 15, this.widthCell - 15);
      this.countCircle++;
    }
  }

  cellExist: boolean = false;

  allCirclesMove() {
    for (var j = 0; j < this.Cells.length; j++)
      for (var i = 0; i < this.Cells[j].length; i++) {
        if (this.Cells[j][i].CellIsNotNull())
          if (!this.Cells[j][i].circleIsNotNull() && this.Cells[j][i].typeCell == 0) {
            if (j == 0) {
              this.scheduleOnce(function () {
                this.node.dispatchEvent(new cc.Event.EventCustom('moveCircleEnd', true));
              }, this.iter);
            }
            if (j >= 1) {
              this.swapCircleInCell(i, j, i, j - 1);
            }
            if (!this.cellExist) {
              if (j >= 1 && i < this.Cells[j].length - 1) {
                if (Math.floor(Math.random() * Math.floor(2)) == 1) {
                  this.swapCircleInCell(i, j, i - 1, j - 1);
                  if (!this.cellExist) this.swapCircleInCell(i, j, i + 1, j - 1);
                }
                else this.swapCircleInCell(i, j, i + 1, j - 1);
                if (!this.cellExist) this.swapCircleInCell(i, j, i - 1, j - 1);
              }
              if (i == 0 && j >= 1) {
                this.swapCircleInCell(i, j, i + 1, j - 1);
              }
              if (i == this.Cells[j].length - 1 && j >= 1) {
                this.swapCircleInCell(i, j, i - 1, j - 1);
              }
            }
          }
      }

  }

  private swapCircleInCell(i, j, newi, newj) {
    if (this.validateCircleMove(i, j, newi, newj)) {
      this.Cells[j][i]._circle = this.Cells[newj][newi]._circle;
      this.Cells[newj][newi]._circle = null;
      this.moveCircle(this.Cells[j][i]._circle, this.Cells[j][i].node.position);
      this.cellExist = true;
      return;
    }
    this.cellExist = false;
  }

  private validateCircleMove(i, j, newi, newj) {
    if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i].CellIsNotNull(), this.Cells[newj][newi] != null))
      if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell == 0, this.Cells[newj][newi].typeCell == 0))
        if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i]._circle == null, this.Cells[newj][newi]._circle != null)) return true;
    return false;
  }



  private moveCircle(circle, toMove) {
    var _circle = circle.getComponent(Circle);
    _circle.inMove = true;
    cc.tween(circle)
      .parallel(
        cc.tween().to(this.iter, { scale: 1 }),
        cc.tween().to(this.iter, { position: toMove })
      )
      .call(() => {
        this.node.dispatchEvent(new cc.Event.EventCustom('moveCircleEnd', true));
      })
      .start()
  }

  private tmpCountCircle: number = 0;

  private fieldOnFilledWithCircles() {
    var allcirclenowinfield = 0;
    var allcirclenowinfieldandnotmove = 0;
    for (var j = 0; j < this.Cells[0].length; j++) {
      for (var i = 0; i < this.Cells[j].length; i++)
        if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell == 0, this.Cells[j][i].circleIsNotNull())) {
          allcirclenowinfield++;
          if (!this.Cells[j][i]._circle.getComponent(Circle).inMove) allcirclenowinfieldandnotmove++;
          else this.Cells[j][i]._circle.getComponent(Circle).inMove = false;
        }
    }
    cc.log(allcirclenowinfield);
    cc.log(allcirclenowinfieldandnotmove);
    if (allcirclenowinfieldandnotmove == allcirclenowinfield) return false;
    return false;
  }

  private getClickCell() {
    for (var j = 0; j < this.Cells.length; j++)
      for (var i = 0; i < this.Cells[j].length; i++)
        if (this.Cells[j][i].wasClick) {
          this.Cells[j][i].wasClick = false;
          cc.log("cliced")
          return this.Cells[j][i];
        }
    return null;
  }



  private horizont: boolean = false;
  private vertical: boolean = false;
  private goDestroyThreeInArow: boolean = false;

  private InArow() {

    for (var j = 0; j < this.Cells.length; j++) {
      for (var i = 0; i < this.Cells[j].length; i++) {
        this.goDestroyThreeInArow = true;
        if (j >= 2) {
          this.vertical = false;
          this.horizont = true;
          this.InArowTmp(i, j, i, j - 1, i, j - 2);
        }
        if (i < this.Cells[j].length - 2) {
          this.horizont = false;
          this.vertical = true;
          this.InArowTmp(i, j, i + 1, j, i + 2, j);
        }
      }
    }
  }


  private InArowTmp(i, j, iOne, jOne, iTwo, jTwo) {
    if (this.Cells[j][i] != null && this.Cells[jOne][iOne] != null && this.Cells[jTwo][iTwo] != null) {
      var tmpBool1 = CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell == 0, this.Cells[jOne][iOne].typeCell == 0);
      var tmpBool2 = CheckerBoolean.checkTwoBoolean(tmpBool1, this.Cells[jTwo][iTwo].typeCell == 0);
      if (tmpBool2) {
        tmpBool1 = CheckerBoolean.checkTwoBoolean(this.Cells[j][i].circleIsNotNull(), this.Cells[jOne][iOne].circleIsNotNull());
        tmpBool2 = CheckerBoolean.checkTwoBoolean(tmpBool1, this.Cells[jTwo][iTwo].circleIsNotNull())
        if (tmpBool2) {
          var tmpBool3 = CheckerBoolean.EqualsTrheeObj(this.Cells[j][i]._circle.getComponent(Circle).CircleTypeColor,
            this.Cells[jOne][iOne]._circle.getComponent(Circle).CircleTypeColor,
            this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor);
          if (tmpBool3) {
            if (this.vertical) {
              if (i < this.Cells[j].length - 4) {
                this.createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, jTwo, iTwo + 1, jTwo, iTwo + 2, 3);
              }
              if (i < this.Cells[j].length - 3 && this.goDestroyThreeInArow) {
                this.createLightning(i, j, iOne, jOne, iTwo, jTwo, jTwo, iTwo + 1, 2);
              }
            }
            if (this.horizont) {
              if (j >= 4) {
                this.createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, jTwo - 1, iTwo, jTwo - 2, iTwo, 3);
              }
              if (j >= 3 && this.goDestroyThreeInArow) {
                this.createLightning(i, j, iOne, jOne, iTwo, jTwo, jTwo - 1, iTwo, 1);
              }
            }
            if (this.goDestroyThreeInArow) {
              this.check3Circle(this.Cells[j][i], this.Cells[jOne][iOne], this.Cells[jTwo][iTwo]);
              this.eventDestoyArow();

            }
          }
        }
      }
    }
  }

  private createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, iThree, jThree, iFour, jFour, tipe) {
    if (this.Cells[iThree][jThree] != null && this.Cells[iFour][jFour] != null) {
      var bool1 = CheckerBoolean.checkTwoBoolean(this.Cells[iThree][jThree].typeCell == 0, this.Cells[iThree][jThree].circleIsNotNull());
      var bool2 = CheckerBoolean.checkTwoBoolean(this.Cells[iFour][jFour].typeCell == 0, this.Cells[iFour][jFour].circleIsNotNull());
      if (CheckerBoolean.checkTwoBoolean(bool1, bool2)) {
        var bool3 = CheckerBoolean.EqualsTrheeObj(this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor,
          this.Cells[iThree][jThree]._circle.getComponent(Circle).CircleTypeColor,
          this.Cells[iFour][jFour]._circle.getComponent(Circle).CircleTypeColor);
        if (bool3) {
          cc.log("RainbowCreate");
          this.Cells[j][i]._circle.getComponent(Circle).setTipe(tipe);
          cc.log(this.Cells[j][i]._circle.getComponent(Circle).CircleType);
          this.check3Circle(this.Cells[jOne][iOne], this.Cells[jTwo][iTwo], this.Cells[iThree][jThree]);
          this.startCheckCircleForDestroy(this.Cells[iFour][jFour]);
          this.goDestroyThreeInArow = false;
          this.eventDestoyArow();
        }
      }
    }
  }

  private createLightning(i, j, iOne, jOne, iTwo, jTwo, iThree, jThree, tipe) {
    if (this.Cells[iThree][jThree] != null)
      if (CheckerBoolean.checkTwoBoolean(this.Cells[iThree][jThree].typeCell == 0, this.Cells[iThree][jThree].circleIsNotNull()))
        if (CheckerBoolean.EqualsTwoObj(this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor,
          this.Cells[iThree][jThree]._circle.getComponent(Circle).CircleTypeColor)) {
          var circle = this.Cells[j][i]._circle.getComponent(Circle);
          circle.setTipe(tipe);
          this.check3Circle(this.Cells[jOne][iOne], this.Cells[jTwo][iTwo], this.Cells[iThree][jThree]);
          this.goDestroyThreeInArow = false;
          this.eventDestoyArow();
        }
  }

  private destroyRainbowBall(Cell, circle) {
    for (var j = 0; j < this.Cells.length; j++) {
      for (var i = 0; i < this.Cells[j].length; i++) {
        if (this.Cells[j][i].circleIsNotNull())
          var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
        else return;
        if (Cell != this.Cells[j][i] &&
          circle.CircleTypeColor === currentCircle.CircleTypeColor) {
          if (circle.CircleType === currentCircle.CircleType)
            this.animateDestroyCircle(this.Cells[j][i]);
          else this.startCheckCircleForDestroy(this.Cells[j][i])
        }
      }
    }
  }

  private destroyLightningVertical(Cell, circle) {
    var j = Cell.jcolumn;
    for (var i = 0; i < this.Cells[j].length; i++) {
      if (Cell != this.Cells[j][i] && this.Cells[j][i].CellIsNotNull()) {
        if (this.Cells[j][i].circleIsNotNull())
          var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
        else return;
        if (circle.CircleType === currentCircle.CircleType)
          this.animateDestroyCircle(this.Cells[j][i]);
        else this.startCheckCircleForDestroy(this.Cells[j][i]);
      }
    }
  }

  private destroyLightningHorizont(Cell, circle) {
    var i = Cell.irow;
    var thisCircle = circle.getComponent(Circle);
    for (var j = 0; j < this.Cells.length; j++) {
      if (Cell != this.Cells[j][i] && this.Cells[j][i] != null) {
        if (this.Cells[j][i].circleIsNotNull())
          var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);

        if (currentCircle != null)
          if (circle.CircleType === currentCircle.CircleType)
            this.animateDestroyCircle(this.Cells[j][i]);
          else
            this.startCheckCircleForDestroy(this.Cells[j][i]);
      }
    }
  }

  private destroylightningVerticalAndlightningHorizont(Cell, circle) {
    this.destroyLightningVertical(Cell, circle);
    this.destroyLightningHorizont(Cell, circle);
  }

  private check3Circle(Cell1, Cell2, Cell3) {
    this.startCheckCircleForDestroy(Cell1);
    this.startCheckCircleForDestroy(Cell2);
    this.startCheckCircleForDestroy(Cell3);
  }

  private startCheckCircleForDestroy(Cell) {
    this.startTypeDestroer(Cell);
    this.animateDestroyCircle(Cell);
  }

  private startTypeDestroer(Cell) {
    if (Cell.circleIsNotNull()) {
      var circle = Cell._circle.getComponent(Circle);
      switch (circle.CircleType) {
        case tipeCircle.lightningVerticalAndlightningHorizont: {
          this.destroylightningVerticalAndlightningHorizont(Cell, circle);
          break;
        }
        case tipeCircle.rainbowBall: {
          this.destroyRainbowBall(Cell, circle);
          break;
        }
        case tipeCircle.lightningVertical: {
          this.destroyLightningVertical(Cell, circle);
          break;
        }
        case tipeCircle.lightningHorizont: {
          this.destroyLightningHorizont(Cell, circle);
          break;
        }
        case tipeCircle.normal: {
          this.animateDestroyCircle(Cell);
          break;
        }
      }
    }
  }

  private destroyEveryCircles() {
    for (var j = 0; j < this.Cells.length; j++) {
      for (var i = 0; i < this.Cells[j].length; i++) {
        this.animateDestroyCircle(this.Cells[j][i]);
      }
    }
    this.scheduleOnce(function () {
      this.node.dispatchEvent(new cc.Event.EventCustom('destroyCircles', true));
    }, this.iter + 0.1);
    this.scheduleOnce(function () {
      this.node.dispatchEvent(new cc.Event.EventCustom('needCheckField', true));
    }, (this.iter + 0.2) * 4);

  }

  private eventDestoyArow() {
    this.scheduleOnce(function () {
      this.node.dispatchEvent(new cc.Event.EventCustom('destroyCircles', true));
    }, this.iter);
  }

  animationStart: boolean = true;

  private animateDestroyCircle(Cell) {
    if (Cell != null)
      cc.tween(Cell._circle)
        .parallel(
          cc.tween().to(this.iter, { scale: 0 }),
          cc.tween().to(this.iter, {})
        )
        .call(() => {
          if (Cell._circle != null) {
            this.countCircle--;
            this.getTypeDestroyCircle(Cell._circle.getComponent(Circle));
            this.node.dispatchEvent(new cc.Event.EventCustom('setPoint', true));
            Cell._circle.destroy();
            Cell._circle = null;
          }
        }).start()
  }

  getTypeDestroyCircle(circle) {
    this.destroyTipeColors[circle.CircleTypeColor]++;
    cc.log(this.destroyTipeColors[circle.CircleTypeColor]);
    this.node.dispatchEvent(new cc.Event.EventCustom('setDestroyCirclesType', true));
  }

}