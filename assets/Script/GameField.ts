
import { Circle } from "./Circle";
import { Cell } from "./Cell";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameField extends cc.Component {

    //TODО - очистить от легаси переменных и комментарией,после переписки алгоритма.
    //поле - содержит в себе данные о клетках и фишках, правила игрового поля - т.е. логика игры - должна быть тут
    //TODО избавится от лишней рефлексии,закешировать компоненты,там где это необходимо.

    static gameField: GameField;
    //кружок для инстантинейта
    @property(cc.Prefab)
    Circle: cc.Prefab = null;
    //клетка для инстантитейта
    @property(cc.Prefab)
    Cell: cc.Prefab = null;
    //необходиомсть генерировать неактивные клетки
    @property
    needRandomVoidCell:boolean = true;
    @property
    ChangeForCreateAnActiveCell:number= 25;
    //итерация появления фишек (время за которое фишка выпадает и умирает)
    @property
    iter:number =0.1;
    //а тут если вдруг захотим поменяьт координаты первой создаваемой клетки
    @property 
    StartCellPosX:number=-150;
    @property
    StartCellPosY:number= 250;
    //если вдруг захотим поменять размеры клетки
    @property 
    lenghtCell:number=62;
    @property
    widthCell:number=62;

    //счетчик фишек - для того,чтобы определять - полное ли поле или нет
    countCircle:number=0;
    previousCountCircle:number=0;

    //поле клеток, тут можно подрегулировать его размеры
    Cells: Cell[][];

    currentI_cell_click:number=0;
    currentJ_cell_click:number=0;

    onLoad () {
      this.Cells =[
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
        [,,,,,,,,],
      ];
    }

    onEnable() {
      this.createCells();
      this.setTypeCellsOnIandJ( 4, 0, this.Cells.length, 4, 1);
      this.CreateCircles();
    }

    onDisable() {
      this.DestroyCircles();
    }

    start() {
 
    }

    //метод управляет поведением шариков,после уничтожения
    clickDestroyCircleInCell(){
      this.countCircle--;
      this.node.dispatchEvent(new cc.Event.EventCustom('setPoint',true));
      this.allCirclesMove();
    }
    
    createOneLineCircles(){
      for(var i=0;i<this.Cells[0].length;i++) { 
        this.createCircle(this.Cells[0][i]);
      }
      this.needCheckField();
    }

    needCheckField(){ 
        if (!this. fieldOnFilledWithCircles()) {
          this.allCirclesMove();
        } else this.node.dispatchEvent(new cc.Event.EventCustom('needCheckField',true));
   
    }

    checkLine() {
        this.InArow();
        cc.log("fied fullness");
    }

    //заполняем поле клетками
    createCells() {
      var xPos:number = 0;
      var yPos:number = 0;
      var _cell;  
      for (var j=0;j<this.Cells.length;j++) {
        for(var i=0;i<this.Cells[j].length; i++) {
          _cell = cc.instantiate(this.Cell);
          _cell.setContentSize(this.lenghtCell, this.widthCell);
          //_cell.size(this.lenghtCell, this.widthCell);
          _cell.setParent(this.node);
          _cell.setPosition(this.StartCellPosX + xPos, this.StartCellPosY+ yPos);
          this.Cells[j][i] = _cell.getComponent(Cell);
          if (i%2!=0 && j%2==0) { this.Cells[j][i].setAnyColor(); }
          if (i%2==0 && j%2!=0) { this.Cells[j][i].setAnyColor(); }
          if (this.needRandomVoidCell) this.createAnyTypeCell(this.Cells[j][i], 1);
          this.Cells[j][i].jcolumn = j;
          this.Cells[j][i].irow = i;
          xPos=xPos+this.lenghtCell;
        }
        xPos=0;
        yPos=yPos-this.widthCell;
      }
    }

    createAnyTypeCell(Cell, type) {
      if (Math.floor((Math.random() * this.ChangeForCreateAnActiveCell) + 1)==1) {
        Cell.typeCell=type;
        Cell.setColorInType();
      }
    }

    setTypeCellsOnIandJ(i_,j_, iLength, jLegth, type) {
      for (var j=j_;j < jLegth; j++) {
        for(var i=i_;i < iLength; i++) {
          this.Cells[j][i].typeCell=type;
          this.Cells[j][i].setColorInType();
        }
      }
    }

    //заполняет поле фишками
    CreateCircles(){
      for (var j=0;j<this.Cells.length;j++)
        for(var i=0;i<this.Cells[j].length;i++) { 
          if (this.Cells[j][i].typeCell==0) this.createCircle(this.Cells[j][i]);
        }
        this.node.dispatchEvent(new cc.Event.EventCustom('needCheckField',true));
       // this.node.emit('needCheckField');
    }

    //заполняет поле фишками
    DestroyCircles(){
      for (var j=0;j<this.Cells.length;j++)
        for(var i=0;i<this.Cells[j].length;i++) { 
          if (this.Cells[j][i].circleIsNotNull()) {
            this.Cells[j][i]._circle.destroy();
            this.Cells[j][i]._circle=null;
          }
        }
    }

    //создаёт шарик в одной клетке
    createCircle(Cell) {
      if (Cell._circle==null && Cell.typeCell==0) {
          Cell._circle = cc.instantiate(this.Circle);
          Cell._circle.setParent(this.node);
          Cell._circle.setPosition(Cell.node.position);
          Cell._circle.setContentSize(this.lenghtCell-15, this.widthCell-15);
          this.countCircle++;
      } 
    }

    //существование клетки,куда перемещаться
    cellExist:boolean=false;
    //TODO отрефакторить
    //двигает всё шарики в поле
    allCirclesMove() {
      //цикл двигается снизу вверх,но не справа в лево,а с лева в право.
      for (var j=0;j<this.Cells.length;j++)
        for(var i=0;i<this.Cells[j].length;i++) { 
          if (this.Cells[j][i]!=null)
            if (!this.Cells[j][i].circleIsNotNull() && this.Cells[j][i].typeCell==0) { 
           //если уничтожин верхний ряд
              if (j==0) {      
                this.scheduleOnce(function() {
                this.node.dispatchEvent(new cc.Event.EventCustom('moveCircleEnd',true));
                //this.node.emit('moveCircleEnd');
                },this.iter); 
              }
           //алгоритм движения вниз
              if (j>=1) {
                this.swapCircleInCell(i, j, i, j-1);
              }
         //если вверух нет клетки
              if (!this.cellExist) {
                //алгоритм движения вправо или в лево, если движение вниз невозможно и это не краевые значения
                if (j>=1 && i<this.Cells[j].length-1) { 
                  //случайно выбираем движение - слева или справа, если выпало =1.то двигаемся слева,
                  if (Math.floor(Math.random() * Math.floor(2))==1) { 
                      this.swapCircleInCell(i, j, i-1, j-1); 
                      //если движение слева не возможно - двигаем с права
                      if (!this.cellExist) this.swapCircleInCell(i, j, i+1, j-1);
                  }
                  //выпл 0 - двигаемся с права
                  else this.swapCircleInCell(i, j, i+1, j-1);
                  //если движение с права не возможно - двигаемся с лева.
                  if (!this.cellExist) this.swapCircleInCell(i, j, i-1, j-1);
                }
                //движение на краевой значение при i=0
                if (i==0 && j>=1) {
                  this.swapCircleInCell(i, j, i+1, j-1);
                }
                //движение на краевой значение при i==предпоследней клетке
                if (i==this.Cells[j].length-1 && j>=1) {
                  this.swapCircleInCell(i, j, i-1, j-1);
                }
              } 
            }
      }
   
    }

    //метод проталкивает фишку в клетки
    private swapCircleInCell(i,j,newi,newj) {
      if (this.Cells[j][i]!=null) {
        if(this.Cells[j][i].typeCell==0) {
          if (this.Cells[j][i]._circle==null) {
            if (this.Cells[newj][newi]!=null) {  
              if(this.Cells[newj][newi].typeCell==0) { 
                if (this.Cells[newj][newi]._circle!=null) {
                  this.Cells[j][i]._circle = this.Cells[newj][newi]._circle;
                  this.Cells[newj][newi]._circle = null;
                  this.moveCircle(this.Cells[j][i]._circle, this.Cells[j][i].node.position);
                  this.cellExist=true;
                  return;
                }
              } 
            }
          }  
        }
      }
      this.cellExist=false; 
    }

    //двигает шарик, в параллельном потоке
    moveCircle(circle, toMove) {
      var _circle = circle.getComponent(Circle);
      _circle.inMove = true; 
      cc.tween(circle)
          .parallel(
            cc.tween().to(this.iter, { scale: 1 }),
            cc.tween().to(this.iter, { position: toMove })
          )
          .call(() => {
            this.node.dispatchEvent(new cc.Event.EventCustom('moveCircleEnd',true));
          })
          .start()
    }

    tmpCountCircle:number=0;
    fieldOnFilledWithCircles() {
      var allcirclenowinfield=0;
      var allcirclenowinfieldandnotmove=0;
      for(var j=0;j<this.Cells[0].length;j++) { 
        for(var i=0;i<this.Cells[j].length;i++)
          if (this.Cells[j][i].typeCell==0) { 
            if (this.Cells[j][i].circleIsNotNull()) { 
              allcirclenowinfield++;
              if (!this.Cells[j][i]._circle.getComponent(Circle).inMove) allcirclenowinfieldandnotmove++;
              else this.Cells[j][i]._circle.getComponent(Circle).inMove = false;
            } 
          }
      }
      cc.log(allcirclenowinfield);
      cc.log(allcirclenowinfieldandnotmove);
      if (allcirclenowinfieldandnotmove==allcirclenowinfield) return false;
      return false;
    }

    //клетка,по которой кликнули
    getClickCell() {
      for (var j=0;j<this.Cells.length;j++) {
        for(var i=0;i<this.Cells[j].length; i++) 
          if (this.Cells[j][i].wasClick) { 
            this.Cells[j][i].wasClick=false;
            return this.Cells[j][i];
        }
      }
    }

    //высыпались в ряд
    
    horizont:boolean=false;
    vertical:boolean=false;
    goDestroyThreeInArow:boolean=false;

    InArow() {
    
      for (var j=0;j<this.Cells.length;j++){
      
        for(var i=0;i<this.Cells[j].length;i++) {
          this.goDestroyThreeInArow=true;
           //высыпались по диагонали
           if (j>=2) {
            this.vertical=false;
            this.horizont=true;
            this.InArowTmp(i,j,i,j-1,i,j-2);
          }
           //высыпались по вертикале
          if (i<this.Cells[j].length-2) {
            this.horizont=false;
            this.vertical=true;
            this.InArowTmp(i,j,i+1,j,i+2,j);
          }
        }
      }
    }

    //тут логика проверки высыпавшихся фишек
    private InArowTmp(i,j,iOne,jOne,iTwo,jTwo) {
      if (this.Cells[j][i]!=null && this.Cells[jOne][iOne]!=null && this.Cells[jTwo][iTwo]!=null) {
        var tmpBool1= CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell==0 ,this.Cells[jOne][iOne].typeCell==0);
        var tmpBool2 = CheckerBoolean.checkTwoBoolean(tmpBool1, this.Cells[jTwo][iTwo].typeCell==0);
        if (tmpBool2) {
          tmpBool1= CheckerBoolean.checkTwoBoolean(this.Cells[j][i].circleIsNotNull(),this.Cells[jOne][iOne].circleIsNotNull());
          tmpBool2= CheckerBoolean.checkTwoBoolean(tmpBool1, this.Cells[jTwo][iTwo].circleIsNotNull())
          if (tmpBool2) {
            var tmpBool3 = CheckerBoolean.EqualsTrheeObj(this.Cells[j][i]._circle.getComponent(Circle).CircleTypeColor, 
                                                         this.Cells[jOne][iOne]._circle.getComponent(Circle).CircleTypeColor, 
                                                         this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor);
            if (tmpBool3) {
              //создаём вертикальную молнию или шар
              if (this.vertical) { 
                if (i<this.Cells[j].length-4) {
                  this.createRainbowBall(i,j,iOne,jOne,iTwo,jTwo, jTwo, iTwo + 1,jTwo, iTwo + 2, 3);
                }
                if (i<this.Cells[j].length-3 && this.goDestroyThreeInArow) {
                  this.createLightning(i,j,iOne,jOne,iTwo,jTwo, jTwo, iTwo + 1, 2);
                }
              }
              //создаём горизонтальную молнию или шар
              if (this.horizont) { 
                if (j>=4) {
                  this.createRainbowBall(i,j,iOne,jOne,iTwo,jTwo, jTwo-1, iTwo,jTwo-2, iTwo, 3);
                } 
                if (j>=3 && this.goDestroyThreeInArow) {
                  this.createLightning(i,j,iOne,jOne,iTwo,jTwo, jTwo-1, iTwo, 1);
                }
              }
              if (this.goDestroyThreeInArow) {
                this.Check3Circle(this.Cells[j][i], this.Cells[jOne][iOne],this.Cells[jTwo][iTwo]);
                this.eventDestoyArow(); 
               
              }
            } 
          }
        }
      }
    }

    //шар
    private createRainbowBall(i,j,iOne,jOne,iTwo,jTwo,iThree,jThree,iFour,jFour,tipe) {
      if (this.Cells[iThree][jThree]!=null && this.Cells[iFour][jFour]!=null ) {
        var bool1 = CheckerBoolean.checkTwoBoolean(this.Cells[iThree][jThree].typeCell==0, this.Cells[iThree][jThree].circleIsNotNull());
        var bool2 = CheckerBoolean.checkTwoBoolean(this.Cells[iFour][jFour].typeCell==0, this.Cells[iFour][jFour].circleIsNotNull());
        if (CheckerBoolean.checkTwoBoolean(bool1, bool2)) { 
          var bool3 = CheckerBoolean.EqualsTrheeObj(this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor,
                                                    this.Cells[iThree][jThree]._circle.getComponent(Circle).CircleTypeColor,
                                                    this.Cells[iFour][jFour]._circle.getComponent(Circle).CircleTypeColor);
          if (bool3) {
            cc.log("RainbowCreate");
            this.Cells[j][i]._circle.getComponent(Circle).setTipe(tipe);
            cc.log(this.Cells[j][i]._circle.getComponent(Circle).CircleType);
            this.Check3Circle(this.Cells[jOne][iOne],this.Cells[jTwo][iTwo], this.Cells[iThree][jThree]);
            this.startCheckCircleForDestroy(this.Cells[iFour][jFour]);
            this.goDestroyThreeInArow=false;
            this.eventDestoyArow(); 
          }
        }
      }
    }

    //молния
    private createLightning(i,j,iOne,jOne,iTwo,jTwo,iThree,jThree, tipe) {
      if (this.Cells[iThree][jThree]!=null)
      if (CheckerBoolean.checkTwoBoolean(this.Cells[iThree][jThree].typeCell==0, this.Cells[iThree][jThree].circleIsNotNull()))
        if (CheckerBoolean.EqualsTwoObj(this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor,
            this.Cells[iThree][jThree]._circle.getComponent(Circle).CircleTypeColor)) { 
              var circle = this.Cells[j][i]._circle.getComponent(Circle);
              circle.setTipe(tipe);
              this.Check3Circle(this.Cells[jOne][iOne],this.Cells[jTwo][iTwo], this.Cells[iThree][jThree]);
              this.goDestroyThreeInArow=false;
              this.eventDestoyArow(); 
          
        }
    }

    destroyRainbowBall(Cell, circle){
      for (var j=0;j<this.Cells.length;j++) {
        for (var i=0;i<this.Cells[j].length;i++) {
          if (this.Cells[j][i].circleIsNotNull())
          var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
          if (currentCircle!=null)
          if (Cell!=this.Cells[j][i] && 
              circle.CircleTypeColor === currentCircle.CircleTypeColor) {
            if (circle.CircleType!=currentCircle.CircleType)
              this.startCheckCircleForDestroy(this.Cells[j][i])
            else this.animateDestroyCircle(this.Cells[j][i]);
          }
        }
      }
    }

    destroyLightningVertical(Cell, circle){
      var j= Cell.jcolumn;
      for (var i=0;i<this.Cells[j].length;i++) {
       if (Cell!=this.Cells[j][i] && this.Cells[j][i]!=null ) {  
        if (this.Cells[j][i].circleIsNotNull())
        var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
        if (currentCircle!=null)
        if (circle.CircleType!=currentCircle.CircleType)
          this.startCheckCircleForDestroy(this.Cells[j][i]);
          else this.animateDestroyCircle(this.Cells[j][i]);
        } 
      }
    }

    destroyLightningHorizont(Cell, circle){
      var i = Cell.irow;
      for (var j=0;j<this.Cells.length;j++) {
        if (Cell!=this.Cells[j][i] &&this.Cells[j][i]!=null){ 
          if (this.Cells[j][i].circleIsNotNull())
          var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
          if (currentCircle!=null)
          if (circle.CircleType!=currentCircle.CircleType)
            this.startCheckCircleForDestroy(this.Cells[j][i]); 
          else 
            this.animateDestroyCircle(this.Cells[j][i]);
        }
      }
    }

    destroylightningVerticalAndlightningHorizont(Cell,circle) {
      this.destroyLightningVertical(Cell, circle);
      this.destroyLightningHorizont(Cell, circle);
    }

    private Check3Circle(Cell1,Cell2,Cell3) {
      this.startCheckCircleForDestroy(Cell1);
      this.startCheckCircleForDestroy(Cell2);
      this.startCheckCircleForDestroy(Cell3);
    }

    startCheckCircleForDestroy(Cell){
      this.startTypeDestroer(Cell);
      this.animateDestroyCircle(Cell);
    }

    startTypeDestroer(Cell) {
      if (Cell.circleIsNotNull()) {
        var circle = Cell._circle.getComponent(Circle);
        switch(circle.CircleType) {
          case 4: { 
            this.destroylightningVerticalAndlightningHorizont(Cell,circle);
            break; 
          }
          case 3: { 
            this.destroyRainbowBall(Cell,circle);
            break; 
          }
          case 2: {  
            this.destroyLightningVertical(Cell,circle);
            break; 
          }
          case 1: {  
            this.destroyLightningHorizont(Cell,circle);
            break; 
          }
          case 0: { 
            this.animateDestroyCircle(Cell);
            break; 
          }
        }
      }
    }

    destroyEveryCircles() {
      for (var j=0;j<this.Cells.length;j++) {
        for (var i=0;i<this.Cells[j].length;i++) {
          this.startCheckCircleForDestroy(this.Cells[j][i]);
        }
      }
      this.scheduleOnce(function() {
        this.node.dispatchEvent(new cc.Event.EventCustom('destroyCircles',true));
      },this.iter+0.1); 
    }

    private eventDestoyArow() {
      this.scheduleOnce(function() {
        this.node.dispatchEvent(new cc.Event.EventCustom('destroyCircles',true));
      },this.iter); 
    }

    animationStart:boolean=true;

    private animateDestroyCircle(Cell) {
      if (Cell!=null)
        cc.tween(Cell._circle)
          .parallel(
          cc.tween().to(this.iter, { scale: 0 }),
          cc.tween().to(this.iter, { })
          )
        .call(() => {
          if (Cell._circle!=null) {
            this.countCircle--;
            this.node.dispatchEvent(new cc.Event.EventCustom('setPoint',true));
            Cell._circle.destroy();
            Cell._circle=null;
          }
        }).start()
    }
}

//вспомогательный класс с булевой алгеброй и сравнениями
class  CheckerBoolean {

  static checkTwoBoolean(one, two){
    return one & two;
  }

  static checkTrheeBoolean(one, two, trhee){
    return one & two & trhee;
  }

  static EqualsTwoObj(one, two){
    if (one===two) return true;
      else
    return false;
  }

  static EqualsTrheeObj(one, two, trhee){
    if (one===two) 
      if (two===trhee) return true;
      else
    return false;
  }
}

