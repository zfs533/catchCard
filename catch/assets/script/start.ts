import UIBase from "./src/common/uibase";
import GlobalUtil from "./src/utils/global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends UIBase {
    /**
     * Member attribute
     */

    @property(cc.AudioClip)
    clip: cc.AudioClip = null;

    @property(cc.Button)
    private lbb: cc.Label = null;
    private _isJumping: boolean = false;

    onLoad() {
        this._initView(this.node);
    }

    start() {
        cc.audioEngine.play(this.clip, true, 1);
        this._view['btn_start'].on(cc.Node.EventType.TOUCH_END, () => { cc.director.loadScene(GlobalUtil.sceneLobby) }, this);
    }
}
