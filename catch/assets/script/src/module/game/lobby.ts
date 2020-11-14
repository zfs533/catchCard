import UIBase from "../../common/uibase";
import GlobalUtil from "../../utils/global";
import Control from "./control";
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends UIBase {
    @property(cc.Label)
    public labName: cc.Label = null;
    @property(cc.Node)
    public helpNode: cc.Node = null;
    @property(cc.Node)
    public setNode: cc.Node = null;
    onLoad() {
        this._initView(this.node);
    }
    start() {
        this._view['btn_hall_1'].on(cc.Node.EventType.TOUCH_END, () => { cc.director.loadScene(GlobalUtil.sceneGame) }, this);
        this._view['btn_hall_2'].on(cc.Node.EventType.TOUCH_END, () => { cc.director.loadScene(GlobalUtil.sceneGame) }, this);
        this._view['btn_hall_3'].on(cc.Node.EventType.TOUCH_END, () => { cc.director.loadScene(GlobalUtil.sceneGame) }, this);
        this._view['btn_hall_4'].on(cc.Node.EventType.TOUCH_END, () => { cc.director.loadScene(GlobalUtil.sceneGame) }, this);
        this.labName.string = Control.Instance.playerOwnName;
    }

    public showHelpNode(): void {
        this.helpNode.active = true;
    }
    public showSetNode(): void {
        this.setNode.active = true;
    }
}
