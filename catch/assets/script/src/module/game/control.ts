import EventManager from "../../common/eventManager";
import GlobalUtil, { GameState, GameSpyType, generateName } from "../../utils/global";

export default class Control {
    private static _instance: Control;
    public static get Instance(): Control {
        if (!Control._instance) {
            Control._instance = new Control();
        }
        return Control._instance;
    }
    private _pukerNumber: any[] = [];
    /* 判断当前一轮是否结束>=2 连续有两个玩家不要则一轮结束*/
    private _gameRound: number = 0;
    /* 游戏状态 */
    public gameStatus: number = GameState.Free;
    /* 明暗特务类型(默认为暗特务) */
    public gameSpyType: number = GameSpyType.Dark;
    public gameIsOver: boolean = false;
    public playerOwnName: string = "启博";
    /* 是否为首家出牌 */
    public playerOwnIsFirst: boolean = false;
    public init(): void {
        this.playerOwnIsFirst = false;
        EventManager.Instance.registerEvent(EventManager.EvtReciveCardData, this._evtReciveCardData.bind(this), this);
    }

    /**
     * 为玩家生成手牌
     */
    public generateCard(): void {
        this._pukerNumber = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,              //black
            15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,     //red
            29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,     //mei       
            43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,     //fang
            57, 58                                       //大小王
        ];
        let cards1 = this._generateOnce();
        let cards2 = this._generateOnce();
        let cards3 = this._generateOnce();
        EventManager.Instance.dispatchEvent(EventManager.EvtCreateCards, { id: 1, data: cards1 });
        EventManager.Instance.dispatchEvent(EventManager.EvtCreateCards, { id: 2, data: cards2 });
        EventManager.Instance.dispatchEvent(EventManager.EvtCreateCards, { id: 3, data: cards3 });
    }
    /**
     * 生成玩家扑克数据，没人18张
     */
    private _generateOnce(): any[] {
        let cards: any[] = [];
        for (let i = 0; i < GlobalUtil.player_card_num; i++) {
            let rand: number = Math.floor(Math.random() * this._pukerNumber.length);
            cards.push(this._pukerNumber[rand]);
            this._pukerNumber.splice(rand, 1);
        }
        return cards;
    }

    /**
     * 接收到用户出牌数据
     * @param data {set:当前玩家座位号，otherCards:上家出牌数据}
     */
    private _evtReciveCardData(data: any): void {
        /* 下一个出牌玩家 */
        let nextSet: number = this.getNextSet(data.set);
        if (data.otherCards.length == 0) {
            this._gameRound++;
        }
        else {
            this._gameRound = 0;
        }
        let round = this._gameRound;
        let dt = { set: data.set, otherCards: data.otherCards, nextSet: nextSet, round: round };
        EventManager.Instance.dispatchEvent(EventManager.EvtShowOutCardData, dt);
    }

    /**
     * 获取下一个出牌玩家座位号
     * （出牌顺序按照1-2-3-1-2-3来循环）
     * @param set 
     */
    public getNextSet(set: number): number {
        let nextSet = set + 1;
        if (nextSet > GlobalUtil.gameWay) {
            nextSet = GlobalUtil.playerLeft;
        }
        return nextSet;
    }

    public removeEventListener(): void {
        this.playerOwnIsFirst = false;
        EventManager.Instance.removeEvent(EventManager.EvtReciveCardData, this._evtReciveCardData.bind(this), this);
    }
}