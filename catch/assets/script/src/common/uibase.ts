const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBase extends cc.Component {
    protected _view: cc.Node[] = [];

    /**
     * 
     * @param node 
     */
    protected _initView(node: cc.Node): void {
        for (let i = 0; i < node.childrenCount; i++) {
            this._view[node.children[i].name] = node.children[i];
            this._initView(node.children[i]);
        }
    }
}
