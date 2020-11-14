import UIBase from "../../common/uibase";
import Control from "./control";
import NodePool from "../../utils/nodePool";
import Card from "./card";
import Head from "./head"
import EventManager from "../../common/eventManager";
import GlobalUtil, { PukerType, showTipsInfo, ErrInfo, GameSpyType, GameState, GameResultType } from "../../utils/global";
import GameLogic from "./gameLogic";
import GameResult from "./gameResult";
const { ccclass, property } = cc._decorator;
@ccclass
export default class GameScene extends UIBase {
    @property(cc.Prefab)
    preCard: cc.Prefab = null;
    @property(cc.Label)
    labLast1: cc.Label = null;
    @property(cc.Label)
    labLast2: cc.Label = null;
    @property(cc.Button)
    btnBack: cc.Button = null;
    @property(cc.Node)
    public resultNode: cc.Node = null;
    /* 扑克牌坐标 */
    private _pos1: cc.Vec2;
    private _pos2: cc.Vec2;
    private _pos3: cc.Vec2;
    /* 出牌坐标 */
    private _pos5: cc.Vec2;
    private _pos6: cc.Vec2;
    private _pos7: cc.Vec2;
    /* 头像坐标 */
    private _headPos1: cc.Vec2;
    private _headPos2: cc.Vec2;
    private _headPos3: cc.Vec2;
    /* 计时器坐标 */
    private _clockOriginPos: cc.Vec2;
    private _clockPos1: cc.Vec2;
    private _clockPos2: cc.Vec2;
    private _clockPos3: cc.Vec2;
    private _cardArr: any[] = [];
    private _launchCount: number = 0;
    /* 玩家打出去的牌 */
    private _outCard1: any[] = [];
    private _outCard2: any[] = [];
    private _outCard3: any[] = [];
    private _outCard3Ids: any[] = [];
    private _downTime: number = GlobalUtil.downLoadTime;
    @property(cc.Label)
    public labTime: cc.Label = null;
    /* 上家出的牌 */
    private _aboveCards: any[] = [];
    @property(cc.Prefab)
    public preTipNode: cc.Prefab = null;
    private _isGameOver: boolean = false;
    private _interverHandle: number = -1;
    private _tipCount: number = 0;
    onLoad() {
        this._initView(this.node);
    }

    start() {
        this._initProperty();
        this._layoutPlayer();
        this._startTimeDownLoad();
        this._test();
    }

    private _test(): void {

    }
    /**
     * 初始化
     */
    private _initProperty(): void {
        this._pos1 = cc.v2(this._view['card1'].x, this._view['card1'].y);
        this._pos2 = cc.v2(this._view['card2'].x, this._view['card2'].y);
        this._pos3 = cc.v2(this._view['card3'].x, this._view['card3'].y);
        this._pos5 = cc.v2(this._view['card5'].x, this._view['card5'].y);
        this._pos6 = cc.v2(this._view['card6'].x, this._view['card6'].y);
        this._pos7 = cc.v2(this._view['card7'].x, this._view['card7'].y);
        this._headPos1 = cc.v2(this._view['head1'].x, this._view['head1'].y);
        this._headPos2 = cc.v2(this._view['head2'].x, this._view['head2'].y);
        this._headPos3 = cc.v2(this._view['head3'].x, this._view['head3'].y);
        this._clockOriginPos = cc.v2(this._view['clock0'].x, this._view['clock0'].y);
        this._clockPos1 = cc.v2(this._view['clock1'].x, this._view['clock1'].y);
        this._clockPos2 = cc.v2(this._view['clock2'].x, this._view['clock2'].y);
        this._clockPos3 = cc.v2(this._view['clock3'].x, this._view['clock3'].y);
        Control.Instance.init();
        NodePool.Instance.init();
        this._resetProperty();
        EventManager.Instance.registerEvent(EventManager.EvtSelectCard, this._evtSelectCard.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtShowOutCardData, this._evtShowOutCardData.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtShowClock, this._evtShowClock.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtSureLightDark, this._evtSureLightDark.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtShowSpyTagNode, this._evtShowSpyTagNode.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtBackToLobbyScene, this._evtBackToLobbyScene.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtRestartGame, this._evtRestartGame.bind(this), this);
    }

    /**
     * 初始化
     */
    private _resetProperty(): void {
        for (let i = 1; i < 8; i++) {
            this._view["card" + i].active = false;
            if (i < 5) {
                this._view['clock' + (i - 1)].active = false;
            }
        }
        this._cardArr.splice(0);
        this.labLast1.getComponent(cc.Label).string = "0";
        this.labLast2.getComponent(cc.Label).string = "0";
        this._hideClock();
        this._showOutCardNode(false);
        this._evtShowSpyTagNode(false);
        GlobalUtil.finishOrderCount = 0;
        this._isGameOver = false;
        Control.Instance.gameIsOver = false;
        this._launchCount = 0;
    }

    /**
     * 角色出场
     */
    private _layoutPlayer(): void {
        this._view['head1'].x = this._headPos1.x - 100;
        this._view['head2'].x = this._headPos2.x + 100;
        this._view['head3'].x = this._headPos3.x - 100;
        for (let i = 1; i < 4; i++) {
            let script: Head = this._view['head' + i].getComponent(Head);
            script.setId(i);
        }
        this._view['head1'].runAction(cc.moveTo(1, this._headPos1.x, this._view['head1'].y))
        this._view['head2'].runAction(cc.moveTo(1, this._headPos2.x, this._view['head2'].y))
        this._view['head3'].runAction(cc.sequence(cc.moveTo(1, this._headPos3.x, this._view['head3'].y),
            cc.callFunc(() => {
                this._launchCard();
            })
        ))
    }

    /**
     * 发牌准备
     */
    private _launchCard(): void {
        Control.Instance.generateCard();
        this._view['card1'].active = true;
        this._view['card2'].active = true;
        this._view['card4'].active = true;
        this._layoutCard();
    }

    /**
     * 开始发牌了
     */
    private _layoutCard(): void {
        console.log(this._launchCount);
        console.log(GlobalUtil.player_card_num);
        if (this._launchCount >= GlobalUtil.player_card_num) {
            this._launchCardFinished();
            return;
        }
        this._launchCount++;
        this.labLast1.getComponent(cc.Label).string = this._launchCount + "";
        this.labLast2.getComponent(cc.Label).string = this._launchCount + "";
        for (let i = 1; i < 4; i++) {
            let card = NodePool.Instance.getNode(NodePool.PoolPuker);
            if (!card) {
                card = cc.instantiate(this.preCard);
            }
            this._view['desk'].addChild(card);
            this._layoutAction(card, i);
        }
    }
    /**
     * 播放发牌动画
     * @param card 扑克牌
     * @param idx 玩家座位索引
     */
    private _layoutAction(card: any, idx: number): void {
        console.log(idx);
        let time = 0.1;
        if (idx == GlobalUtil.playerLeft) {
            card.runAction(cc.sequence(cc.moveTo(time, this._pos1.x, this._pos1.y),
                cc.callFunc(() => {
                    card.getComponent(Card).removeFromDesk();
                    NodePool.Instance.putNode(card, NodePool.PoolPuker);
                })));
        }
        else if (idx == GlobalUtil.playerRight) {
            card.runAction(cc.sequence(cc.moveTo(time, this._pos2.x, this._pos2.y),
                cc.callFunc(() => {
                    card.getComponent(Card).removeFromDesk();
                    NodePool.Instance.putNode(card, NodePool.PoolPuker);
                })));
        }
        else if (idx == GlobalUtil.playerDown) {
            let moveTo = cc.moveTo(time, 0, this._pos3.y);
            let callbck1 = cc.callFunc(() => { this._cardArr.push(card) });
            let callbck2 = cc.callFunc(() => { this._resetCardPosition() });
            let callbck3 = cc.callFunc(() => {
                this._layoutCard();
            }
            );
            let sequence = cc.sequence(moveTo, callbck1, callbck2, callbck3);
            card.runAction(sequence);

        }
    }
    /**
     * 重设玩家扑克牌位置信息
     */
    private _resetCardPosition(): void {
        for (let i = 0; i < this._cardArr.length; i++) {
            this._cardArr[i].zIndex = i;
            this._cardArr[i].y = this._pos3.y;
            this._cardArr[i].x = (- this._cardArr.length * GlobalUtil.puker_gap / 2) + GlobalUtil.puker_gap * (i + 1);
        }
    }

    /**
     * 排序
     * @param cardArr 
     */
    private _sortCard(cardArr: any[]): void {
        cardArr.sort((a, b) => {
            let as: Card = a.getComponent(Card);
            let bs: Card = b.getComponent(Card);
            return as.sortId - bs.sortId;
        });
    }

    /**
     * 发牌结束
     */
    private _launchCardFinished(): void {
        this._view['card4'].active = false;
        let script: Head = this._view['head3'].getComponent(Head);
        script.setCards(this._cardArr);
        this._cardArr = script.cards;
        this._sortCard(this._cardArr);
        this._resetCardPosition();
        /* 定特务 */
        this._makeSpyType();
        /* 指定一个玩家出牌 */
    }

    /**
     * 定特务
     */
    private _makeSpyType(): void {
        Control.Instance.gameStatus = GameState.LightDark;
        this._evtShowClock();
        this._setClockPos();
        EventManager.Instance.dispatchEvent(EventManager.EvtCallSpyLightDark);
    }

    /**
     * 确定特务（明/暗）
     * @param type 
     */
    private _evtSureLightDark(type: number): void {
        Control.Instance.gameSpyType = type;
        EventManager.Instance.dispatchEvent(EventManager.EvtShowSpyLightDarkTag);
        this._startGame();
    }

    /**
     * 定特务，指定一个玩家出牌
     */
    private _startGame(): void {
        Control.Instance.gameStatus = GameState.Game;
        EventManager.Instance.dispatchEvent(EventManager.EvtOutCardFirst);
    }

    /**
     * 处理选中的牌
     * @param data {id:,bool:}
     */
    private _evtSelectCard(data: any): void {
        if (data.bool) {
            this._outCard3Ids.push(data.id);
        }
        else {
            for (let i = 0; i < this._outCard3Ids.length; i++) {
                if (data.id == this._outCard3Ids[i]) {
                    this._outCard3Ids.splice(i, 1);
                    break;
                }
            }
        }
    }
    /**
     * 清理已经打出去的牌
     * @param cardArr 
     * @param idx 用户
     */
    private clearOutCard(cardArr: any[]): void {
        for (let i = 0; i < cardArr.length; i++) {
            cardArr[i].getComponent(Card).removeFromDesk();
            NodePool.Instance.putNode(cardArr[i], NodePool.PoolPuker);
        }
        cardArr.splice(0);
    }

    /**
     * 从手牌中移除打出去的牌
     */
    private _removeSelectedCard(): void {
        for (let i = 0; i < this._cardArr.length; i++) {
            let script: Card = this._cardArr[i].getComponent(Card);
            if (script.isSelected()) {
                script.removeFromDesk();
                NodePool.Instance.putNode(this._cardArr[i], NodePool.PoolPuker);
                this._cardArr.splice(i, 1);
                this._removeSelectedCard();
                break;
            }
        }
    }

    /**
     * 显示倒计时
     * @param data {set:当前玩家座位号，nextSet:下一个玩家座位号，otherCards:上家出牌数据}
     */
    private _evtShowClock(data: any = null): void {
        this._downTime = GlobalUtil.downLoadTime;
        this._view['clock'].active = true;
        this.labTime.string = this._downTime + "";
        if (data) {
            this._setClockPos(data);
            if (data.nextSet == GlobalUtil.ownSet) {
                this._showOutCardNode(true);
            } else {
                this._showOutCardNode(false);
            }
        }
    }

    /**
     * 隐藏倒计时
     */
    private _hideClock(): void {
        this._view['clock'].active = false;
    }

    /**
     * 开启计时器
     */
    private _startTimeDownLoad(): void {
        // let scheduleId = this.schedule(this._downLoadTime.bind(this), 1);
        this._interverHandle = setInterval(() => {
            this._downLoadTime();
        }, 1000);
    }

    /**
     * 倒计时
     */
    private _downLoadTime(): void {
        if (!this._view['clock'].active) { return; }
        let time = this._getDownLoadTime();
        if (time < 0) {
            this._hideClock();
            this._handleCountDownOver();
            return;
        }
        this.labTime.string = time + "";
        if (Control.Instance.gameStatus == GameState.GameOver) {
            EventManager.Instance.dispatchEvent(EventManager.EvtGameResultCountDown, time);
        }
    }

    private _getDownLoadTime(): number {
        return this._downTime--
    }

    /**
     * 倒计时结束处理
     */
    private _handleCountDownOver(): void {
        let status: number = Control.Instance.gameStatus;
        switch (status) {
            case GameState.Free:
                break;
            case GameState.LightDark:
                this.lightSpy();
                // EventManager.Instance.dispatchEvent(EventManager.EvtSureLightDark, Control.Instance.gameSpyType);
                break;
            case GameState.Game:
                /* 这里只考虑玩家自己，赞不考虑机器人，倒计时结束，直接过 */
                if (Control.Instance.playerOwnIsFirst == true) {
                    let script: Head = this._view['head3'].getComponent(Head);
                    script.sendAutoCard();
                    this._removeSelectedCard();
                    this.cancelOption();
                }
                else {
                    this.crossOver();
                }
                break;
            case GameState.GameOver:
                /* 清理牌桌 */
                this._clearDesk();
                break;
        }
    }

    /**
     * 设置计时器位置
     * @param data {set:当前玩家座位号，nextSet:下一个玩家座位号，otherCards:上家出牌数据}
     */
    private _setClockPos(data: any = null): void {
        if (data) {
            switch (data.nextSet) {
                case GlobalUtil.playerLeft:
                    this._view['ic_clock'].setPosition(this._clockPos1);
                    break;
                case GlobalUtil.playerRight:
                    this._view['ic_clock'].setPosition(this._clockPos2);
                    break;
                case GlobalUtil.playerDown:
                    this._view['ic_clock'].setPosition(this._clockPos3);
                    break;
                default:
                    this._view['ic_clock'].setPosition(this._clockOriginPos);
                    break;
            }
        }
        else {
            this._view['ic_clock'].setPosition(this._clockOriginPos);
        }
    }

    /**
     * 玩家出牌
     */
    public sendCard(): void {
        /* {set:当前玩家座位号，otherCards:上家出牌数据} */
        if (this._outCard3Ids.length == 0) {
            showTipsInfo(this.preTipNode, ErrInfo.c);
            return;
        }
        let cards: any[] = [];
        if (this._aboveCards.length > 0) {
            let oType: number = GameLogic.Instance.getType(this._aboveCards);
            let mType: number = GameLogic.Instance.getType(this._outCard3Ids);
            if (oType != mType) {
                showTipsInfo(this.preTipNode, ErrInfo.b);
                return;
            }
            cards = GameLogic.Instance.getCard(this._aboveCards, this._outCard3Ids);
        }
        else {
            /* 当前玩家为首家出牌 */
            cards = [].concat(this._outCard3Ids);
            let type: number = GameLogic.Instance.getType(cards);
            if (type == PukerType.Error) {
                showTipsInfo(this.preTipNode, ErrInfo.a);
                this.cancelOption();
                return;
            }
        }
        let data = { set: GlobalUtil.ownSet, otherCards: cards };
        EventManager.Instance.dispatchEvent(EventManager.EvtReciveCardData, data);
        if (cards.length > 0) {
            let script: Head = this._view['head3'].getComponent(Head);
            script.removeOutedCard(this._outCard3Ids);
            this._removeSelectedCard();
        }
        this.cancelOption();
    }

    /**
     * 取消
     */
    public cancelOption(): void {
        this._cardArr.forEach((item, index) => {
            let script: Card = item.getComponent(Card);
            script.reductionPos();
        });
        this._outCard3Ids.splice(0);
        this._resetCardPosition();
    }

    /**
     * 提示
     */
    public showTip(): void {
        this._outCard3Ids.splice(0);
        let script: Head = this._view['head3'].getComponent(Head);
        let cardNumArr: any[] = script.getCardNumArr();
        let cards: any[] = [];
        if (Control.Instance.playerOwnIsFirst || this._aboveCards.length == 0) {
            cards = GameLogic.Instance.getCard([4], cardNumArr, true);
        }
        else {
            cards = GameLogic.Instance.getCard(this._aboveCards, cardNumArr, true);
        }
        this._cardArr.forEach((item, index) => {
            let script: Card = item.getComponent(Card);
            script.reductionPos();
        });
        if (cards.length < 1) {
            /* 要不起 */
            this.crossOver();
            return;
        }
        cardNumArr.forEach((item, index) => {
            for (let i = 0; i < cards[this._tipCount].length; i++) {
                if (item == cards[this._tipCount][i]) {
                    EventManager.Instance.dispatchEvent(EventManager.EvtHandleCardTouch, item);
                }
            }
        });
        this._tipCount++;
        if (this._tipCount >= cards.length) {
            this._tipCount = 0;
        }
    }

    /**
     * 不要
     */
    public crossOver(): void {
        if (Control.Instance.playerOwnIsFirst == true) {
            showTipsInfo(this.preTipNode, ErrInfo.d);
            return;
        }
        let data = { set: GlobalUtil.ownSet, otherCards: [] };
        EventManager.Instance.dispatchEvent(EventManager.EvtReciveCardData, data);
    }

    /**
     * 明特务
     */
    public lightSpy(): void {
        this._evtSureLightDark(GameSpyType.Light);
        this._evtShowSpyTagNode(false);
    }

    /**
     * 暗特务
     */
    public darkSpy(): void {
        this._evtSureLightDark(GameSpyType.Dark);
        this._evtShowSpyTagNode(false);
    }

    private _evtBackToLobbyScene(): void {
        this.btnBackEvent();
    }

    /**
     * 返回大厅
     */
    public btnBackEvent(): void {
        this._clearDesk();
        this._removeEventListener();
        clearInterval(this._interverHandle);
        Control.Instance.gameIsOver = true;
        Control.Instance.removeEventListener();
        let script: GameResult = this.resultNode.getComponent(GameResult);
        script.removeEventListener();
        this._isGameOver = true;
        cc.director.loadScene(GlobalUtil.sceneLobby);
    }

    /**
     * 桌面展示出牌数据
     * @param data {set:当前玩家座位号，nextSet:下一个玩家座位号，otherCards:上家出牌数据,round:一轮是否结束}
     */
    private _evtShowOutCardData(data: any): void {
        this._handleShowCardUi(data);
        if (this._gameIsOver()) {
            if (!this._isGameOver) {
                /* 保证这里游戏结束只调用一次 */
                this._isGameOver = true;
                Control.Instance.gameIsOver = this._isGameOver;
                this._handleGameOver();
            }
            return;
        }
        /* 实例化牌 */
        let cards: any[] = [];
        data.otherCards.forEach((item, index) => {
            let card = NodePool.Instance.getNode(NodePool.PoolPuker);
            if (!card) {
                card = cc.instantiate(this.preCard);
            }
            let script: Card = card.getComponent(Card);
            script.setCardId(item);
            card.scale = 0.6;
            cards.push(card);
            this._view['desk'].addChild(card);
        });
        this._sortCard(cards);
        /* 设置位置 */
        switch (data.set) {
            case GlobalUtil.playerLeft:
                this.clearOutCard(this._outCard1);
                this.clearOutCard(this._outCard2);
                this._outCard1 = cards;
                cards.forEach((item, index) => {
                    item.x = this._pos5.x + GlobalUtil.puker_gap * index;
                    item.y = this._pos5.y;
                    item.zIndex = index;
                })
                break;
            case GlobalUtil.playerRight:
                this.clearOutCard(this._outCard2);
                this.clearOutCard(this._outCard3);
                this._outCard2 = cards;
                cards.forEach((item, index) => {
                    item.x = this._pos6.x - GlobalUtil.puker_gap * index;
                    item.y = this._pos6.y;
                    item.zIndex = cards.length - index;
                })
                break;
            case GlobalUtil.playerDown:
                this.clearOutCard(this._outCard3);
                this.clearOutCard(this._outCard1);
                this._outCard3 = cards;
                cards.forEach((item, index) => {
                    item.x = (-cards.length * GlobalUtil.puker_gap / 2) + GlobalUtil.puker_gap * (index + 1);
                    item.y = this._pos7.y;
                    item.zIndex = index;
                })
                break;
            default:
                console.log("error set please check out!");
                break;
        }
        this._refreshLastCardCount();
        data.otherCards = this._aboveCards;
        EventManager.Instance.dispatchEvent(EventManager.EvtOutCard, data);
    }

    /**
     * 刷新剩余牌数据
     */
    private _refreshLastCardCount(): void {
        let player1: Head = this._view['head1'].getComponent(Head);
        let count1 = player1.getLastCardsCount();
        let player2: Head = this._view['head2'].getComponent(Head);
        let count2 = player2.getLastCardsCount();
        this.labLast1.getComponent(cc.Label).string = count1 + "";
        this.labLast2.getComponent(cc.Label).string = count2 + "";
    }

    /**
     * 处理游戏过程中的UI展示
     * @param data {set:当前玩家座位号，nextSet:下一个玩家座位号，otherCards:上家出牌数据,round:一轮是否结束}
     */
    private _handleShowCardUi(data): void {
        if (this._isGameOver) { return; }
        Control.Instance.playerOwnIsFirst = false;
        this._tipCount = 0;
        this._evtShowClock();
        this._setClockPos(data);
        console.log(`不要：${data.round}`);
        if (data.otherCards.length > 0) {
            this._aboveCards = data.otherCards;
        }
        else {
            /* 不要 */
            EventManager.Instance.dispatchEvent(EventManager.EvtShowCannot, data.set)
        }
        if (data.round >= 2) {
            this._aboveCards.splice(0);
            if (data.nextSet == GlobalUtil.ownSet) {
                Control.Instance.playerOwnIsFirst = true;
            }
        }
        let player3: Head = this._view['head3'].getComponent(Head);
        let count = player3.getLastCardsCount();
        if (data.nextSet == GlobalUtil.ownSet && count > 0 && !Control.Instance.gameIsOver) {
            this._showOutCardNode(true);
        } else {
            this._showOutCardNode(false);
        }
    }

    /**
     * 显示/隐藏出牌操作按钮
     * @param bool 
     */
    private _showOutCardNode(bool: boolean): void {
        this._view['outCardNode'].active = bool;
    }

    /**
     * 显示/隐藏明/暗特务按钮
     * @param bool 
     */
    private _evtShowSpyTagNode(bool: boolean): void {
        this._view['spyTagNode'].active = bool;
    }
    /**
     * 游戏是否结束
     */
    private _gameIsOver(): boolean {
        console.log(`finishOrderCount = ${GlobalUtil.finishOrderCount}`);
        return GlobalUtil.finishOrderCount >= 2 ? true : false;;
    }

    /**
     * 处理游戏结束
     */
    private _handleGameOver(): void {
        showTipsInfo(this.preTipNode, "游戏结束");
        this._tipCount = 0;
        EventManager.Instance.dispatchEvent(EventManager.EvtShowSpyLightDarkTag);
        Control.Instance.gameStatus = GameState.GameOver;
        this.scheduleOnce(() => {
            /* 先展示两秒，若为暗特务局，让玩家知道谁是特务 */
            this._showResult();
        }, 2);

    }
    private _showResult(): void {
        this._evtShowClock();
        this._setClockPos();
        /* 判断玩家是否为特务且头家，若是则胜 */
        let script: Head = this._view['head3'].getComponent(Head);
        if (Control.Instance.gameSpyType == GameSpyType.Dark) {
            /* 暗特务 */
            if (script.getFinishCount() == GlobalUtil.finishFirst) {
                EventManager.Instance.dispatchEvent(EventManager.EvtShowGameResult, GameResultType.Win);
            }
            else if (script.getFinishCount() == GlobalUtil.finishSecound) {
                EventManager.Instance.dispatchEvent(EventManager.EvtShowGameResult, GameResultType.Peace);
            }
            else {
                EventManager.Instance.dispatchEvent(EventManager.EvtShowGameResult, GameResultType.Lose);
            }
        }
        else if (Control.Instance.gameSpyType == GameSpyType.Light) {
            /* 明特务 */
            if (script.getFinishCount() == GlobalUtil.finishFirst) {
                EventManager.Instance.dispatchEvent(EventManager.EvtShowGameResult, GameResultType.Win);
            }
            else {
                EventManager.Instance.dispatchEvent(EventManager.EvtShowGameResult, GameResultType.Lose);
            }
        }

    }

    /**
     * 清理桌面
     */
    private _clearDesk(): void {
        EventManager.Instance.dispatchEvent(EventManager.EvtClearHeadData);
        this.clearOutCard(this._outCard1);
        this.clearOutCard(this._outCard2);
        this.clearOutCard(this._outCard3);
        this.clearOutCard(this._cardArr);
        this._resetProperty();
    }

    private _evtRestartGame(): void {
        this._clearDesk();
        this._layoutPlayer();
    }

    private _removeEventListener(): void {
        EventManager.Instance.removeEvent(EventManager.EvtSelectCard, this._evtSelectCard.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtShowOutCardData, this._evtShowOutCardData.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtShowClock, this._evtShowClock.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtSureLightDark, this._evtSureLightDark.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtShowSpyTagNode, this._evtShowSpyTagNode.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtBackToLobbyScene, this._evtBackToLobbyScene.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtRestartGame, this._evtRestartGame.bind(this), this);
    }
}
