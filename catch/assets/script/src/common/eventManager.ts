/* 自定义事件模块 */
export default class EventManager {
    private static _instance: EventManager = null;
    public static get Instance(): EventManager {
        if (!EventManager._instance) {
            EventManager._instance = new EventManager();
        }
        return EventManager._instance;
    }
    /* 事件数组 [{name:[{target:,callback:,}]}] */
    private events: Array<any> = new Array<any>();
    public static EvtSaveMsg = "evt_save_message";
    /* 生成用户扑克数据 */
    public static EvtCreateCards = "evt_create_cards";
    /* 选牌 */
    public static EvtSelectCard = "evt_select_card";
    /* 出牌 */
    public static EvtOutCard = "evt_out_card";
    /* 清理用户数据 */
    public static EvtClearHeadData = "evt_clear_head_data";
    /* 接收到用户出牌数据 */
    public static EvtReciveCardData = "evt_recive_card_data";
    /* 桌面展示出牌数据 */
    public static EvtShowOutCardData = "evt_show_out_card_data";
    /* 出牌首家 */
    public static EvtOutCardFirst = "evt_out_card_first";
    /* 显示计时器 */
    public static EvtShowClock = "evt_show_clock";
    /* 发牌结束，叫明暗特务 */
    public static EvtCallSpyLightDark = "evt_call_spy_light_dark";
    /* 确定明暗特务 */
    public static EvtSureLightDark = "evt_sure_light_dark";
    /* 显示明暗特务操作按钮 */
    public static EvtShowSpyTagNode = "evt_show_spy_tag_node";
    /* 显示明暗特务标记 */
    public static EvtShowSpyLightDarkTag = "evt_show_spy_light_dark_tag";
    /* 结算界面倒计时 */
    public static EvtGameResultCountDown = "evt_game_result_count_down";
    /* 展示游戏结果 */
    public static EvtShowGameResult = "evt_show_game_result";
    /* 返回大厅 */
    public static EvtBackToLobbyScene = "evt_back_to_lobby_scene";
    /* 重新开始游戏 */
    public static EvtRestartGame = "evt_restart_game";
    /* 不出 */
    public static EvtShowCannot = "evt_show_cannot";
    /* 触发扑克点击事件 */
    public static EvtHandleCardTouch = "evt_handle_card_touch";


    /**
     * 注册事件
     * @param {事件类型 string} eventType 
     * @param {回调函数} callback 
     * @param {目标对象} target 
     */
    public registerEvent(event_type: string, callback: Function, target?: any): void {
        if (this.events[event_type]) {
            var ev = { target: target, callback: callback };
            this.events[event_type].push(ev);
        }
        else {
            this.events[event_type] = [];
            var ev = { target: target, callback: callback };
            this.events[event_type].push(ev);
        }
    }

    /**
     * 发送事件
     * @param {事件类型 string} eventType 
     * @param {传递参数} param 
     */
    public dispatchEvent(event_type: string, param?: any): void {
        for (var type in this.events) {
            if (event_type == type) {
                for (var i = 0; i < this.events[event_type].length; i++) {
                    this.events[event_type][i].callback.call(this.events[event_type][i].target, param);
                }
            }
        }
    }

    /**
     * 移除事件
     * @param {事件类型  string} eventType 
     * @param {回调函数} callback 
     * @param {目标对象} target 
     */
    public removeEvent(event_type: string, callback?: Function, target?: any): void {
        for (var type in this.events) {
            if (event_type == type) {
                for (var i = 0; i < this.events[event_type].length; i++) {
                    if (target == this.events[event_type][i].target /*&& this.events[event_type][i].callback == callback*/) {
                        console.log(event_type);
                        this.events[event_type].splice(0);
                        return;
                    }
                }
            }
        }
    }
}
