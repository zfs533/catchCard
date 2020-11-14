import UIBase from "../../common/uibase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class NewClass extends UIBase {

    @property(cc.AudioClip)
    clip: cc.AudioClip = null;

    @property(cc.Node)
    musicOff: cc.Node = null;

    @property(cc.Node)
    musicOn: cc.Node = null;

    private musicId: number = 0;


    public closeSelf(): void {
        this.node.active = false;
    }

    playMusic() {
        this.musicId = cc.audioEngine.play(this.clip, true, 1);
        this.musicOff.active = true;
        this.musicOn.active = false;
    }

    stopMusic() {
        cc.audioEngine.stopAll();
        cc.audioEngine.stop(this.musicId);
        this.musicOff.active = false;
        this.musicOn.active = true;
    }
}
