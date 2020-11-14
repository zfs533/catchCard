import UIBase from "../../common/uibase";
import EventManager from "../../common/eventManager";
import GlobalUtil from "../../utils/global";
const { ccclass, property } = cc._decorator;
@ccclass
export default class Card extends UIBase {
    private _originId: number = 0;
    private _originY: number = -222;
    private _offsetY: number = 28;
    private _isSelected: boolean = false;
    public sortId: number = 0;
    private cardIds: any[] = [
        "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12", "a13",
        "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "b10", "b11", "b12", "b13",
        "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "c12", "c13",
        "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "d11", "d12", "d13",
        "xiao", "da",
    ]
    private pukerNumber = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,              //black
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,     //red
        29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,     //mei       
        43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,     //fang
        57, 58                                       //大小王
    ];
    onLoad() {
        this._initView(this.node);
        EventManager.Instance.registerEvent(EventManager.EvtHandleCardTouch, this._evtHandleCardTouch.bind(this), this);
    }

    start() {
        this._initProperty();
    }
    private _initProperty(): void {
        for (let i = 0; i < this.cardIds.length; i++) {
            this._view[this.cardIds[i]].active = false;
        }
        this._view['p_back'].active = true;
        this._isSelected = false;
    }

    /**
     *  设置扑克牌点数
     * @param cardId 
     */
    setCardId(cardId: number, isOption: boolean = false): void {
        this._originId = cardId;
        this._handleSortId(cardId);
        if (!this._view['p_back']) {
            this.scheduleOnce(() => {
                this.setCardId(cardId);
            }, 0.1);
            return;
        }
        this._view['p_back'].active = false;
        let index = this.pukerNumber.indexOf(cardId);
        this._view[this.cardIds[index]].active = true;
        if (isOption) {
            this._view[this.cardIds[index]].on(cc.Node.EventType.TOUCH_END, this._handleCardTouch.bind(this));
        }
    }

    /**
     * 事件驱动牌点击事件
     * @param cardId 
     */
    private _evtHandleCardTouch(cardId: number): void {
        if (cardId == this._originId) {
            this._handleCardTouch(null);
        }
    }

    /**
     * 牌点击事件
     * @param event 
     */
    private _handleCardTouch(event: any): void {
        if (!this._isSelected) {
            this.setSelected(true);
            this.node.y += this._offsetY;
        }
        else {
            this.node.y = this._originY;
            this.setSelected(false);
        }
        EventManager.Instance.dispatchEvent(EventManager.EvtSelectCard, { id: this._originId, bool: this._isSelected });
    }

    public setSelected(bool: boolean): void {
        this._isSelected = bool;
    }

    /**
     * 坐标和状态还原
     */
    public reductionPos(): void {
        this.node.y = this._originY;
        this._isSelected = false;
    }

    /**
     * 排序Id
     * 单牌：一张一张的出牌，大小顺序是“黑桃A”〉“黑桃K”〉大王〉小王〉3〉2〉A〉K〉Q〉J〉10〉9〉8〉7〉6〉5〉4(三人玩法“核桃K”是普通K)。
     * @param cardId 
     */
    private _handleSortId(cardId: number): void {
        let sortCard = cardId % GlobalUtil.yuNumber;
        if (cardId == 57 || cardId == 58) {
            sortCard = sortCard + 16;
        }
        else if (sortCard == 1 || sortCard == 2 || sortCard == 3) {
            sortCard = sortCard + 13;
        }
        this.sortId = sortCard;
    }

    public isSelected(): boolean {
        return this._isSelected;
    }
    removeFromDesk(): void {
        this._initProperty();
        this.node.scale = 1;
        this.node.setPosition(cc.v2(0));
    }
}
