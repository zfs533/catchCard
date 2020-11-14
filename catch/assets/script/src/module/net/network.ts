import DataViewUtils from "./dataviewUtils";
import UIBase from "../../common/uibase";
import EventManager from "../../common/eventManager";
const { ccclass, property } = cc._decorator;

@ccclass
export default class NetWork extends UIBase {
    private socket: WebSocket;
    onLoad() {
        this.connect();
    }
    connect(): void {
        this.socket = new WebSocket("ws://192.168.1.119:8888/ws");
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = () => { console.log("onopen") };
        this.socket.close = () => { console.log("close") };
        this.socket.onerror = () => { console.log("onerror") };
        this.socket.onmessage = (req) => {
            let message = req.data;
            let buf = new Uint8Array(message).buffer;
            let dtView = new DataView(buf);

            let head = DataViewUtils.getHeadData(dtView);
            let body = DataViewUtils.decoding(dtView, buf.byteLength);
            EventManager.Instance.dispatchEvent(EventManager.EvtSaveMsg, body);
        };
    }
}