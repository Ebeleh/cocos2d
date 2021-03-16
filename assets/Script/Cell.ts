
const {ccclass, property} = cc._decorator;
  
@ccclass
//клетка - объект клетки
export class Cell extends cc.Component {
    //TODO релиз очистить от ненужных переменных и легаси комментариев
    @property
    //клетка генератор?
    generator: boolean = false;
    //номер строки,где лежит клетка
    irow:number=0;
    //номер столбца ,где лежит клетка
    jcolumn:number=0;

    TypeColor: typeColor=0;

    typeCell: typeCell=0;
    //кружок в клетке в данный момент
    _circle: cc.Node = null;
    wasClick:boolean=false;

    onLoad () {
             //подписка на событие клика
        this.node.on('mousedown', this.mousedown, this);
    }

    start() {
        
    }
    
    //установка более светлого серого цвета
    setAnyColor() {
        this.node.color = new cc.Color(197, 197, 197);
    }

    setWhiteColor() {
        this.node.color = new cc.Color(255, 255, 255);
    }
    
    setColorInType() {
       if (this.typeCell==1) this.setWhiteColor();
    }

    mousedown() {
        this.wasClick=true;
        this.destroyCircle();
       
    }

    destroyCircle(){
        //уничтожение фишки 
        if (this._circle!=null){
            this._circle.destroy();
            this._circle=null;
            this.node.dispatchEvent(new cc.Event.EventCustom('clickOnCellForDestroyCircle',true));
        }
    }

    circleIsNotNull() {
        if (this._circle!=null) return true;
        else return false;
    }


}
enum typeCell {
    normal = 0,
    franzy,
}


enum typeColor {
    gray = 0,
    white,
}

//клетка на переделку.
class Cell0 {
    generator: boolean = false;
    activeself: boolean = true;
    readonly irow:number=0;
    readonly jcolumn:number=0;
    _circle: cc.Node = null;
    constructor(iRow: number, iColumn: number) {
        this.irow = iRow;
        this.jcolumn = iColumn;
    }

}