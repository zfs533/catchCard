import GlobalUtil, { PukerType } from "../../utils/global";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GameLogic {
    private static _instance: GameLogic;
    public static get Instance(): GameLogic {
        if (!GameLogic._instance) {
            GameLogic._instance = new GameLogic();
        }
        return GameLogic._instance;
    }
    /* 当前玩家手牌数据 */
    private _currentCards: any[] = [];
    /* 上家打出的牌数据 */
    private _otherCards: any[] = [];
    /* 当前玩家选中的牌 */
    private _selectCards: any[] = [];
    /**
     * 获取牌型
     * @param cardArr 
     */
    public getType(cardArr: any[]): number {
        let type = -1;
        switch (cardArr.length) {
            case 0:
                type = PukerType.Error;
                break;
            case 1:
                type = PukerType.Single;
                break;
            case 2:
                type = this._jugementTwo(cardArr);
                break;
            case 4:
                type = this._jugementThree(cardArr);
                break;
            case 6:
                type = this._jugementFour(cardArr);
                break;
            default: break;
        }
        return type;
    }

    /**
     * 判断是否为对子
     * @param cardArr 
     */
    private _jugementTwo(cardArr: any[]): number {
        let type = PukerType.Error;
        /* 对子 */
        if ((cardArr[0] % GlobalUtil.yuNumber) == (cardArr[1] % GlobalUtil.yuNumber)) {
            type = PukerType.Double;
        }
        else if (cardArr[0] == GlobalUtil.wangxiao || cardArr[0] == GlobalUtil.wangda) {
            if (cardArr[1] == GlobalUtil.wangxiao || cardArr[1] == GlobalUtil.wangda) {
                type = PukerType.Double;
            }
        }
        /* 王对 */
        return type;
    }

    /**
     *获取数组中的相同项目
     * @memberof GameLogic
     */
    private _getTempJuge(cardArr: any[]): any[] {
        let temp = [];
        cardArr.forEach((item, index) => {
            let count = 0;
            for (let i = 0; i < cardArr.length; i++) {
                if (cardArr[i] % GlobalUtil.yuNumber == item % GlobalUtil.yuNumber) {
                    count++;
                }
            }
            temp.push(count);
        })
        return temp;
    }

    /**
     * 判断是否为三代一
     * @param cardArr 
     */
    private _jugementThree(cardArr: any[]): number {
        let type = PukerType.Error;
        let temp: any[] = this._getTempJuge(cardArr);
        let index = temp.indexOf(3);
        if (index > -1) {
            type = PukerType.ThreeByOne;
        }
        return type;
    }

    /**
     * 判断四带二类型
     * @param cardArr 
     */
    private _jugementFour(cardArr: any[]): number {
        let type = PukerType.Error;
        let temp: any[] = this._getTempJuge(cardArr);
        let index = temp.indexOf(4)
        if (index > -1) {
            /* 带两个单牌 */
            index = temp.indexOf(1);
            if (index > -1) {
                type = PukerType.FourBytwoSingle;
            }
            else {
                /* 带一对 */
                type = PukerType.FourBytwoDouble;
            }
        }
        return type;
    }

    /**
     * 根据上家打出的牌获取出牌数据
     * @param otherCard 上家打出的牌
     * @param currentCards 玩家手牌
     */
    public getCard(otherCard: any[], currentCards: any[], isTipOpt: boolean = false): any[] {
        this._otherCards = otherCard;
        this._currentCards = currentCards;
        let type = this.getType(otherCard);
        console.log(`type = ${type}`)
        let cards: any[] = this._getCardByType(type, isTipOpt);
        return cards;
    }

    /**
     * 根据上家打出的牌判断当前选中的牌是否可以出
     * @param otherCard 上家打出的牌
     * @param selectCards 玩家选中的扑克牌
     */
    public jugementCanSend(otherCard: any[], selectCards: any[]) {
        this._otherCards = otherCard;
        this._currentCards = selectCards;
        let otype = this.getType(otherCard);
        let mtype = this.getType(selectCards);
        let cards: any[] = [];
        if (otype == mtype) {
            cards = this._getCardByType(mtype);
        }
        return cards;
    }

    /**
     * 根据牌型获取出牌数据
     * @param type 牌型
     */
    private _getCardByType(type, isTipOpt: boolean = false): any[] {
        let cards: any[] = [];
        switch (type) {
            case PukerType.Single:
                cards = this._getSingleCard(isTipOpt);
                break;
            case PukerType.Double:
                cards = this._getDoubleCard(isTipOpt);
                break;
            case PukerType.ThreeByOne:
                cards = this._getThreeByOne(isTipOpt);
                break;
            case PukerType.FourBytwoSingle:
                cards = this._getFourByTwoSingle(isTipOpt);
                break;
            case PukerType.FourBytwoDouble:
                cards = this._getFourByTwoSingle(isTipOpt);
                break;
        }
        return cards;
    }

    /**
     * 获取单牌
     * 单牌：一张一张的出牌，大小顺序是“黑桃A”〉“黑桃K”〉大王〉小王〉3〉2〉A〉K〉Q〉J〉10〉9〉8〉7〉6〉5〉4(三人玩法“核桃K”是普通K)。
     */
    private _getSingleCard(isTipOpt: boolean = false): any[] {
        let cards: any[] = [];
        if (this._isSpyCardOrPair()) {
            return cards;
        }
        let oValue = this.getCardValue(this._otherCards[0]);
        let groups: any[] = this._handleGroups();
        let signle: any[] = this._getGroupedByType(groups, PukerType.Single);
        /* 优先从单牌中选取 */
        for (let i = 0; i < signle.length; i++) {
            let value = this.getCardValue(signle[i][0])
            if (value > oValue) {
                cards.push(signle[i][0])
                if (!isTipOpt) {
                    break;
                }
            }
        }
        if (!isTipOpt) {
            if (cards.length < 1) {
                for (let i = 0; i < this._currentCards.length; i++) {
                    let value = this.getCardValue(this._currentCards[i]);
                    if (value > oValue) {
                        cards.push(this._currentCards[i]);
                        break;
                    }
                }
            }
        }
        else {
            this._currentCards.forEach((item, index) => {
                let value = this.getCardValue(item)
                if (cards.length > 0 && value > oValue) {
                    let isHave: boolean = false;
                    for (let i = 0; i < cards.length; i++) {
                        if (cards[i] == item) {
                            isHave = true;
                            break;
                        }
                    }
                    if (!isHave) {
                        cards.push(item);
                    }
                }
                else {
                    if (value > oValue) {
                        cards.push(item);
                    }
                }
            })
        }
        if (cards.length < 1) {
            /* 查看是否有特务牌 */
            cards = this._getSpyCard(PukerType.Single);
        }
        if (isTipOpt) {
            let temp = [];
            cards.forEach((item, index) => {
                temp.push([item]);
            });
            cards = temp;
        }
        return cards;
    }

    /**
     * 获取对牌
     * 对子：成双出牌，大小顺序：特务对〉王对〉3对〉2对〉A对〉K对〉Q对〉J对〉10对〉9对〉8对〉7对〉6对〉5对〉4对(三人玩法王对最大)。
     */
    private _getDoubleCard(isTipOpt: boolean = false): any[] {
        let cards: any[] = [];
        if (this._isSpyCardOrPair()) {
            return cards;
        }
        let groups: any[] = this._handleGroups();
        let double: any[] = this._getGroupedByType(groups, PukerType.Double);
        /* 优先从对子中选取 */
        cards = this._getCardDTF(double, isTipOpt);
        if (cards.length < 1) {
            let three: any[] = this._getGroupedByType(groups, PukerType.ThreeByOne);
            cards = this._getCardDTF(three, isTipOpt);
        }
        if (cards.length < 1) {
            let four: any[] = this._getGroupedByType(groups, PukerType.FourBytwoDouble);
            cards = this._getCardDTF(four, isTipOpt);
        }
        if (cards.length < 1 && !isTipOpt) {
            if (cards.length < 1) {
                /* 查看是否有特务对 */
                cards = this._getSpyCard(PukerType.Double);
            }
        }
        return cards;
    }

    private _getCardDTF(arr: any[], isTipOpt: boolean = false): any[] {
        let oValue = this.getCardValue(this._otherCards[0]);
        let cards: any[] = [];
        for (let i = 0; i < arr.length; i++) {
            let item = arr[i]
            if (this.getCardValue(item[0]) > oValue) {
                if (!isTipOpt) {
                    cards.push(item[0]);
                    cards.push(item[1]);
                    break;
                }
                else {
                    let temp = [];
                    temp.push(item[0]);
                    temp.push(item[1]);
                    cards.push(temp);
                }
            }
        }
        return cards;
    }

    /**
     * 获取三代一
     */
    private _getThreeByOne(isTipOpt: boolean = false): any[] {
        let cards: any[] = [];
        /* 先将上家的三张一样的牌取出来 */
        let otherGroup: any[] = this._handleGroups(this._otherCards);
        let otherThree = [];
        otherGroup.forEach((item, index) => {
            if (item.length == 3) {
                otherThree = item;
            }
        });
        let oValue = this.getCardValue(otherThree[0]);
        /* 从玩家手牌中取出3张相同的牌 */
        let groups: any[] = this._handleGroups();
        let three: any[] = this._getGroupedByType(groups, PukerType.ThreeByOne);
        for (let i = 0; i < three.length; i++) {
            let item = three[i];
            if (this.getCardValue(item[0]) > oValue) {
                if (!isTipOpt) {
                    cards = item;
                    break;
                }
                else {
                    cards.push(item);
                }
            }
        }
        if (cards.length < 1) {
            let four: any[] = this._getGroupedByType(groups, PukerType.FourBytwoDouble);
            for (let i = 0; i < four.length; i++) {
                let item = four[i];
                if (this.getCardValue(item[0]) > oValue) {
                    if (!isTipOpt) {
                        cards.push(item[0]);
                        cards.push(item[1]);
                        cards.push(item[2]);
                        break;
                    }
                    else {
                        let temp = [];
                        temp.push(item[0]);
                        temp.push(item[1]);
                        temp.push(item[2]);
                        cards.push(temp);
                    }
                }
            }
        }
        if (cards.length > 0) {
            let signle: any[] = this._getGroupedByType(groups, PukerType.Single);
            /* 优先从单牌中选取3带牌 */
            if (signle.length > 0) {
                if (!isTipOpt) {
                    cards.push(signle[0][0])
                }
                else {
                    for (let i = 0; i < cards.length && i < signle.length; i++) {
                        cards[i].push(signle[i][0]);
                    }
                }
            }
            else {
                cards.push(this._getOneCard(cards[0]));
            }
        }
        if (cards.length > 0 && isTipOpt) {
            for (let i = 0; i < cards.length; i++) {
                if (cards[i].length < 4) {
                    cards[i].push(this._getOneCard(cards[i][0]));
                }
            }
        }
        return cards;
    }

    private _getOneCard(cardNum: number): number {
        for (let i = 0; i < this._currentCards.length; i++) {
            if (this._currentCards[i] != cardNum) {
                return this._currentCards[i];
            }
        }
    }

    /**
     * 获取4带二
     */
    private _getFourByTwoSingle(isTipOpt: boolean = false): any[] {
        let cards: any[] = [];
        /* 先将上家的四张一样的牌取出来 */
        let otherGroup: any[] = this._handleGroups(this._otherCards);
        let otherFour = [];
        otherGroup.forEach((item, index) => {
            if (item.length == 4) {
                otherFour = item;
            }
        });
        let oValue = this.getCardValue(otherFour[0]);
        /* 从玩家手牌中取出四张相同的牌 */
        let groups: any[] = this._handleGroups();
        let four: any[] = this._getGroupedByType(groups, PukerType.FourBytwoDouble);
        for (let i = 0; i < four.length; i++) {
            let item = four[i];
            if (this.getCardValue(item[0]) > oValue) {
                if (!isTipOpt) {
                    cards = cards.concat(item);
                    break;
                }
                else {
                    cards.push(item);
                }
            }
        }
        if (cards.length > 0) {
            /* 优先从单牌中选取4带牌 */
            let single: any[] = this._getGroupedByType(groups, PukerType.Single);
            if (single.length > 1) {
                if (!isTipOpt) {
                    cards.push(single[0][0])
                    cards.push(single[1][0])
                }
                else {
                    cards[0].push(single[0][0])
                    cards[0].push(single[1][0])
                }
            }
            else {
                for (let i = 0; i < this._currentCards.length; i++) {
                    if (this._currentCards[i] != cards[0]) {
                        if (!isTipOpt) {
                            cards.push(this._currentCards[i]);
                        }
                        else {
                            cards[0].push(this._currentCards[i]);
                        }
                    }
                    if (!isTipOpt) {
                        if (cards.length >= 6) {
                            break;
                        }
                    }
                    else {
                        if (cards[0].length >= 6) {
                            break;
                        }
                    }
                }
            }
        }
        return cards;
    }

    /**
     * 从已经分组的数据中获取所有需要类型数据
     * @param groups 
     */
    private _getGroupedByType(groups: any[], type: number): any[] {
        let cards: any[] = [];
        switch (type) {
            case PukerType.Single:
                groups.forEach((item, index) => {
                    if (item.length == 1) {
                        cards.push(item);
                    }
                });
                break;
            case PukerType.Double:
                groups.forEach((item, index) => {
                    if (item.length == 2) {
                        cards.push(item);
                    }
                });
                break;
            case PukerType.ThreeByOne:
                groups.forEach((item, index) => {
                    if (item.length == 3) {
                        cards.push(item);
                    }
                });
                break;
            case PukerType.FourBytwoSingle:
                groups.forEach((item, index) => {
                    if (item.length == 4) {
                        cards.push(item);
                    }
                });
                break;
            case PukerType.FourBytwoDouble:
                groups.forEach((item, index) => {
                    if (item.length == 4) {
                        cards.push(item);
                    }
                });
                break;
        }
        return cards;
    }

    /**
     * 将扑克牌分组，单，对，三，四
     */
    private _handleGroups(cardArr?: any[]): any[] {
        let curCards = cardArr ? cardArr : this._currentCards;
        let groups = [];
        let pushFunc = (param) => {
            for (let i = 0; i < groups.length; i++) {
                let item = groups[i];
                for (let j = 0; j < item.length; j++) {
                    let value1 = this.getCardValue(param);
                    let value2 = this.getCardValue(item[j]);
                    if (value1 == value2) {
                        item.push(param);
                        return true;
                    }
                }
            }
            return false;
        }
        for (let i = 0; i < curCards.length; i++) {
            let bool = pushFunc(curCards[i]);
            if (!bool) {
                groups.push([curCards[i]]);
            }
        }
        return groups;
    }

    /**
     * 获取牌的大小
     * @param cardId 
     */
    public getCardValue(cardId: number): number {
        let sortCard = cardId % GlobalUtil.yuNumber;
        if (cardId == 57 || cardId == 58) {
            sortCard = sortCard + 16;
        }
        else if (sortCard == 1 || sortCard == 2 || sortCard == 3) {
            sortCard = sortCard + 13;
        }
        return sortCard;
    }

    /**
     * 获取特务对或特务单牌
     * @param type 
     */
    private _getSpyCard(type: number): any[] {
        let spyCard: number = GlobalUtil.spyCardA;
        let cards: any[] = [];
        if (type == PukerType.Single) {
            /* 获取特务牌 */
            this._currentCards.forEach((item, index) => {
                if (item == spyCard) {
                    cards.push(item);
                }
            });
        }
        else if (type == PukerType.Double) {
            /* 获取特务对 */
            let groups: any[] = this._handleGroups();
            let double: any[] = this._getGroupedByType(groups, PukerType.Double);
            cards = this._getDoubleSpy(double);
            if (cards.length < 1) {
                let three: any[] = this._getGroupedByType(groups, PukerType.ThreeByOne);
                cards = this._getDoubleSpy(three);
            }
            if (cards.length < 1) {
                let four: any[] = this._getGroupedByType(groups, PukerType.FourBytwoDouble);
                cards = this._getDoubleSpy(four);
            }
            if (cards.length > 2) {
                cards.sort((a, b) => { return a - b });
                cards = cards.slice(0, 2);
            }
        }
        return cards;
    }

    /**
     * 从分组后的牌中获取特务对对子
     * @param arr [[],[]]
     */
    private _getDoubleSpy(arr: any[]): any[] {
        let spyCard: number = GlobalUtil.spyCardA;
        let cards: any[] = [];
        arr.forEach((item, index) => {
            for (let i = 0; i < item.length; i++) {
                if (item[i] == spyCard) {
                    cards = cards.concat(item);
                    break;
                }
            }
        });
        return cards;
    }

    /**
     * 判断上家是否出的特务牌或特务对子
     */
    private _isSpyCardOrPair(): boolean {
        let isSpy: boolean = false;
        this._otherCards.forEach((item, index) => {
            if (item == GlobalUtil.spyCardA) {
                isSpy = true;
            }
        });
        return isSpy;
    }
}



