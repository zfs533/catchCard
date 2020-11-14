const { ccclass, property } = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {

    public closeSelf(): void {
        this.node.active = false;
    }
}
