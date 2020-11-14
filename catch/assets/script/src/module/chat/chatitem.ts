import UIBase from "../../common/uibase";
import EventManager from "../../common/eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChatItem extends UIBase {
    onLoad() {
        this._initView(this.node);
    }
    start() {
        this._resizeContent();
    }
    setLbText(str: string): void {
        this._view['lb'].getComponent(cc.Label).string = str;

        this._resizeContent();
    }

    _resizeContent(): void {
        let size = this._view['lb'].getContentSize();
        this.node.setContentSize(cc.director.getScene().width, size.height + 10);
    }
}
