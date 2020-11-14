import EventManager from "../../common/eventManager";
import { GameResultType, GameState } from "../../utils/global";
import Control from "./control";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GameResult extends cc.Component {

    @property(cc.Label)
    countDownLb: cc.Label = null;
    @property(cc.Node)
    winNode: cc.Node = null;
    @property(cc.Node)
    peaceNode: cc.Node = null;
    @property(cc.Node)
    loseNode: cc.Node = null;
    @property(cc.Button)
    btnContinue: cc.Button = null;
    @property(cc.Button)
    btnReturn: cc.Button = null;
    onLoad() {
        this._hideAll();
        EventManager.Instance.registerEvent(EventManager.EvtGameResultCountDown, this._evtGameResultCountDown.bind(this), this);
        EventManager.Instance.registerEvent(EventManager.EvtShowGameResult, this._evtShowGameResult.bind(this), this);
    }

    private _hideAll(): void {
        this.node.zIndex = 500;
        this.winNode.active = false;
        this.peaceNode.active = false;
        this.loseNode.active = false;
        this.node.active = false;
    }

    public btnContinueFunc(): void {
        this._hideAll();
        Control.Instance.gameStatus = GameState.Free;
        EventManager.Instance.dispatchEvent(EventManager.EvtRestartGame);
    }

    public btnReturnFunc(): void {
        this._hideAll();
        EventManager.Instance.dispatchEvent(EventManager.EvtBackToLobbyScene);

    }

    /**
     * 公布游戏结果
     * @param resultType GameResultType
     */
    private _evtShowGameResult(resultType: any): void {
        this.node.active = true;
        if (resultType == GameResultType.Win) {
            this.winNode.active = true;
        }
        else if (resultType == GameResultType.Peace) {
            this.peaceNode.active = true;
        }
        else if (resultType == GameResultType.Lose) {
            this.loseNode.active = true;
        }
    }

    private _evtGameResultCountDown(time: number): void {
        this.countDownLb.string = time + "";
        if (time <= 0) {
            EventManager.Instance.dispatchEvent(EventManager.EvtBackToLobbyScene);
        }
    }

    public removeEventListener(): void {
        EventManager.Instance.removeEvent(EventManager.EvtGameResultCountDown, this._evtGameResultCountDown.bind(this), this);
        EventManager.Instance.removeEvent(EventManager.EvtShowGameResult, this._evtShowGameResult.bind(this), this);
    }
}
