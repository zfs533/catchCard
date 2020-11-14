import UIBase from "../../common/uibase";
import EventManager from "../../common/eventManager";
import ChatItem from "./chatitem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends UIBase {
    @property(cc.Prefab)
    private preChatitem: cc.Prefab = null;
    private contentHeight: number = 0;
    onLoad() {
        this._initView(this.node);
        EventManager.Instance.registerEvent(EventManager.EvtSaveMsg, this._handleMsg.bind(this), this);
    }
    _handleMsg(data) {
        let item = cc.instantiate(this.preChatitem);
        item.getComponent(ChatItem).onLoad();
        item.getComponent(ChatItem).setLbText(data.info);
        this._view['content'].addChild(item);
        this.contentHeight = this.getChildSize();//item.getContentSize().height;
        console.log(this.contentHeight);
        if (this.contentHeight > 640) {
            this._view['content'].setContentSize(960, this.contentHeight);
            this._view['scrollview'].getComponent(cc.ScrollView).scrollToBottom();
        }
    }
    getChildSize(): number {
        let num = 0;
        for (let i = 0; i < this._view['content'].childrenCount; i++) {
            num += this._view['content'].children[i].getContentSize().height;
        }
        return num;
    }
}
