import UIBase from "../../common/uibase";
import NodePool from "../../utils/nodePool";
import GlobalUtil from "../../utils/global";
const { ccclass, property } = cc._decorator;

@ccclass
export default class TipNode extends UIBase {
    @property(cc.Label)
    tipLable: cc.Label = null;

    /**
     * 提示信息
     * @param {string} info
     */
    public showInfo(info: string): void {
        this.node.x = GlobalUtil.scenceWidth / 2;
        this.node.y = GlobalUtil.scenceHeight / 2;
        this.node.active = true;
        if (!this.tipLable) {
            this.scheduleOnce(() => {
                this.showInfo(info);
            }, 0.1);
            return;
        }
        this.tipLable.string = info;
        this.node.runAction(cc.sequence(cc.moveBy(2, 0, 200), cc.callFunc(() => {
            NodePool.Instance.putNode(this.node, NodePool.PoolTipNode);
        })))
    }
}
