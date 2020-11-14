import UIBase from "../../common/uibase";
import EventManager from "../../common/eventManager";
import Card from "./card";
import GlobalUtil, { GameSpyType, generateName } from "../../utils/global";
import GameLogic from "./gameLogic";
import Control from "./control";
import NodePool from "../../utils/nodePool";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Head extends UIBase {
    /* 玩家ID(玩家座位号) */
    private _idd: number = 0;
    /* 扑克数据 */
    private _cardNumArr: any[] = [];
    /* 扑克牌 */
    public cards: any[] = [];
    /* 特务 */
    private _isSpy: boolean = false;
    /* 是否先出牌，红桃4先出牌 */
    private _isFirst: boolean = false;
    /* 第几个出完牌 1，2，3 */
    private _finishCount: number = -1;
    @property(cc.Label)
    public labName: cc.Label = null;
    onLoad() {
        this._cardNumArr = [];
        this.cards = [];
        this._initView(this.node);
    }

    private _registerEventListener(): void {
        EventManager.Instance.registerEvent(EventManager.EvtCreateCards, this._evtCreateCardNum.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtOutCard, this._evtOutCard.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtClearHeadData, this._evtClearHeadData.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtOutCardFirst, this._evtOutCardFirst.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtCallSpyLightDark, this._evtCallSpyLightDark.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtShowSpyLightDarkTag, this._evtShowSpyLightDarkTag.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtShowCannot, this._evtShowCannot.bind(this), this);
    }
    private _removeEventListener(): void {
        EventManager.Instance.removeEvent(EventManager.EvtCreateCards, this._evtCreateCardNum.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtOutCard, this._evtOutCard.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtClearHeadData, this._evtClearHeadData.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtOutCardFirst, this._evtOutCardFirst.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtCallSpyLightDark, this._evtCallSpyLightDark.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtShowSpyLightDarkTag, this._evtShowSpyLightDarkTag.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtShowCannot, this._evtShowCannot.bind(this), this);
    }

    private _showSpyTag(bool: boolean): void {
        if (this._view['spyTag']) {
            this._view['spyTag'].active = bool;
        }
    }

    private _setHeadIco(): void {
        for (let i = 0; i < this.node.childrenCount; i++) {
            this.node.children[i].active = false;
        }
        let i = Math.floor(Math.random() * 9) + 1;
        this._view['avatar_' + i].active = true;
        this._view['bg_3'].active = true;
        this._showSpyTag(false);
        this._registerEventListener();
        this._evtShowCannot(-1);
        this._view['pName'].active = true;
        if (this._idd != GlobalUtil.ownSet) {
            this.labName.string = generateName();
        }
        else {
            this.labName.string = Control.Instance.playerOwnName;
        }
    }

    /**
     * 设置玩家ID
     * @param id 玩家ID(玩家座位号)
     */
    public setId(id: number): void {
        this._idd = id;
        this._cardNumArr.splice(0);
        this._setHeadIco();
    }
    /**
     * 玩家扑克数据
     * @param data 
     */
    private _evtCreateCardNum(data: any): void {
        if (data.id == this._idd) {
            this._cardNumArr = data.data;
            // this._cardNumArr = [1, 15, 29, 43, 47, 48, 49, 24, 38, 52, 53, 54, 55, 39, 40, 41, 57, 58]
            this._cardNumArr.sort((a, b) => {
                let va = GameLogic.Instance.getCardValue(a);
                let vb = GameLogic.Instance.getCardValue(b);
                return va - vb;
            })
            /* 是否包含特务牌黑桃A */
            this._cardNumArr.forEach((item, index) => {
                if (item == GlobalUtil.spyCardA) {
                    this._isSpy = true;
                    return;
                }
            });
            /* 是否包含红桃4，有则为首家出牌 */
            this._cardNumArr.forEach((item, index) => {
                if (item == GlobalUtil.firstCardRedFour) {
                    this._isFirst = true;
                    return;
                }
            });
        }
    }

    /**
     * 设置牌点数信息（仅玩家自己才有）
     * @param cards 
     */
    public setCards(cards: any[]): void {
        this.cards = cards;
        for (let i = 0; i < cards.length; i++) {
            let script: Card = cards[i].getComponent(Card);
            script.setCardId(this._cardNumArr[i], true);
        }
    }

    /**
     * 第一个出牌的用户
     * @param isFirst 玩牌过程中两家不要，该他出牌
     */
    private _evtOutCardFirst(isFirst: boolean = false): void {
        /* test */
        // if (this._idd == GlobalUtil.ownSet) {
        //     this._isFirst = true;
        //     Control.Instance.playerOwnIsFirst = true;
        // }
        // else {
        //     this._isFirst = false;
        // }

        if (this._isFirst && this._idd != GlobalUtil.ownSet || isFirst) {
            EventManager.Instance.dispatchEvent(EventManager.EvtShowClock, { nextSet: this._idd });
            /* 给个定时器模拟玩家在思考出什么牌 */
            setTimeout(() => {
                if (!Control.Instance.gameIsOver && this._cardNumArr.length > 0) {
                    let cards = [this._cardNumArr[0]]
                    this.removeOutedCard(cards);
                    EventManager.Instance.dispatchEvent(EventManager.EvtReciveCardData, { set: this._idd, otherCards: cards });
                }
            }, 3000);
            Control.Instance.playerOwnIsFirst = false;
        }
        else if (this._isFirst && this._idd == GlobalUtil.ownSet) {
            Control.Instance.playerOwnIsFirst = true;
            EventManager.Instance.dispatchEvent(EventManager.EvtShowClock, { nextSet: this._idd });
        }
    }

    /**
     * 玩家为首家，倒计时结束还没出牌就自动出一张单牌
     */
    public sendAutoCard(): void {
        if (!Control.Instance.gameIsOver && this._cardNumArr.length > 0) {
            let cards = [this._cardNumArr[0]]
            let script: Card = this.cards[0].getComponent(Card);
            script.setSelected(true);
            this.removeOutedCard(cards);
            EventManager.Instance.dispatchEvent(EventManager.EvtReciveCardData, { set: this._idd, otherCards: cards });
        }
    }

    /**
     * 从手牌中移除已经打出去的牌
     * @param cardArr 
     */
    public removeOutedCard(cardArr: any[]): void {
        cardArr.forEach((item, index) => {
            for (let i = 0; i < this._cardNumArr.length; i++) {
                if (this._cardNumArr[i] == item) {
                    this._cardNumArr.splice(i, 1);
                    break;
                }
            }
        });
    }

    /**
     * 是否已经出完了牌
     */
    private _jugementIsFinished(data: any): boolean {
        let isFinished: boolean = false;
        if (data.nextSet == this._idd && this._cardNumArr.length <= 0) {
            EventManager.Instance.dispatchEvent(EventManager.EvtReciveCardData, { set: this._idd, otherCards: [] });
            isFinished = true;
        }
        if (this._cardNumArr.length <= 0) {
            if (this._finishCount < 0) {
                this._finishCount = GlobalUtil.finishOrderCount++;
            }
        }
        return isFinished;
    }

    /**
     * 出牌（出牌顺序按照1-2-3-1-2-3来循环）
     * @param data {set:当前玩家座位号，nextSet:下一个玩家座位号，otherCards:上家出牌数据}
     */
    private _evtOutCard(data: any): void {
        if (data.nextSet == this._idd) {
            this._view['labCannt'].active = false;
        }
        setTimeout(() => {
            if (Control.Instance.gameIsOver) { return; }
            if (data.nextSet == this._idd && data.nextSet != GlobalUtil.ownSet) {
                if (this._jugementIsFinished(data)) { return; }
                /* 当前玩家为首家时 */
                if (data.otherCards.length == 0) {
                    this._evtOutCardFirst(true);
                    return;
                }
                let cards: any[] = GameLogic.Instance.getCard(data.otherCards, this._cardNumArr);
                this.removeOutedCard(cards);
                EventManager.Instance.dispatchEvent(EventManager.EvtReciveCardData, { set: this._idd, otherCards: cards });
                this._jugementIsFinished(data)
            }
            else if (data.nextSet == GlobalUtil.ownSet) {
                console.log("该您出牌了");
                this._jugementIsFinished(data);
            }
        }, 1000);
    }

    /**
     * 游戏结束清理用户数据
     * @param data 
     */
    private _evtClearHeadData(data: any): void {
        this._idd = 0;
        this._isSpy = false;
        this._finishCount = -1;
        this._cardNumArr.splice(0);
        this._showSpyTag(false);
        this.cards.forEach((item, index) => {
            item.getComponent(Card).removeFromDesk();
            NodePool.Instance.putNode(item, NodePool.PoolPuker);
        });
        this.cards.splice(0);
        this._removeEventListener();
    }

    /**
     * 获取剩余牌张数
     */
    public getLastCardsCount(): number {
        return this._cardNumArr.length;
    }

    /**
     * 获取牌数据
     */
    public getCardNumArr(): any[] {
        return this._cardNumArr;
    }

    /**
     * 第几家出完牌（1头家，2二家）
     */
    public getFinishCount(): number {
        return this._finishCount;
    }

    /**
     *  是否为特务，是则通报出去
     * @param data 
     */
    private _evtCallSpyLightDark(data: any): void {
        if (this._isSpy) {
            if (this._idd == GlobalUtil.ownSet) {
                EventManager.Instance.dispatchEvent(EventManager.EvtShowSpyTagNode, true);
            }
            else {
                /* 非玩家自己，假装在思考 */
                setTimeout(() => {
                    if (!Control.Instance.gameIsOver) {
                        EventManager.Instance.dispatchEvent(EventManager.EvtSureLightDark, GameSpyType.Light);
                    }
                }, 2000);
            }
        }
    }

    /**
     * 显示明暗特务标志
     * @param data 
     */
    private _evtShowSpyLightDarkTag(data: any): void {
        if (this._isSpy && Control.Instance.gameSpyType == GameSpyType.Light) {
            this._showSpyTag(true);
        }
        else if (this._isSpy && Control.Instance.gameIsOver) {
            /* 若为按特务，游戏结束的时候也得公布下谁是特务 */
            this._showSpyTag(true);
        }
        else {
            this._showSpyTag(false);
        }
    }

    private _evtShowCannot(set: number): void {
        if (set == this._idd && this._cardNumArr.length > 0) {
            this._view['labCannt'].active = true;
        }
        else {
            this._view['labCannt'].active = false;
        }
    }
}
