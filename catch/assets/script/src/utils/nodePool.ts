const { ccclass, property } = cc._decorator;
@ccclass
export default class NodePool {
    private static _instance: NodePool = null;
    public static get Instance(): NodePool {
        if (!this._instance) {
            this._instance = new NodePool();
        }
        return this._instance;
    }
    private _pools = [];
    /* 定义对象池存储的对象类型 */
    public static PoolPuker: string = "puker";
    public static PoolTipNode: string = "tipNode";
    public init(): void {
        this.create(NodePool.PoolPuker);
        this.create(NodePool.PoolTipNode);
    }
    /**
     * 
     * @param type 对象类型
     */
    public create(type: string): void {
        if (!this._pools[type]) {
            this._pools[type] = new cc.NodePool();
        }
    }
    /**
     * 加入缓存池
     * @param node 
     * @param type 
     */
    public putNode(node: any, type: string): void {
        if (this._pools[type]) {
            this._pools[type].put(node);
        }
        else {
            console.error("cannot find pool for type: " + type);
        }
    }
    /**
     * 获取节点对象
     * @param type 类型
     */
    public getNode(type: string): any {
        if (this._pools[type]) {
            return this._pools[type].get();
        }
        else {
            console.error("cannot find pool for type: " + type);
        }
    }
    /**
     * 更加类型获取缓存池大小
     * @param type 
     */
    public getSize(type): number {
        if (this._pools[type]) {
            return this._pools[type].size();
        }
        else {
            console.error("cannot find pool for type: " + type);
        }
    }
    /**
     * 根据类型清理缓存池
     * @param type 
     */
    public clear(type: string): void {
        if (this._pools[type]) {
            return this._pools[type].clear();
        }
        else {
            console.error("cannot find pool for type: " + type);
        }
    }
    /**
     * 清理所有缓存对象
     */
    public clearAll(): void {
        for (var key in this._pools) {
            this._pools[key].clear();
        }
    }
}
