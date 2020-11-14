import NodePool from "./nodePool";
import TipNode from "../module/tip/tipNode";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GlobalUtil {
    public static scenceWidth: number = 1136;
    public static scenceHeight: number = 640;
    public static sceneStart: string = "start";
    public static sceneLobby: string = "lobby";
    public static sceneGame: string = "game";
    public static puker_gap: number = 50;
    /* 玩家座位 */
    public static playerLeft: number = 1;
    public static playerRight: number = 2;
    public static playerDown: number = 3;
    /* 手牌数量 */
    public static player_card_num: number = 18;
    public static yuNumber: number = 14;
    /* 大小王 */
    public static wangxiao: number = 57;
    public static wangda: number = 58;
    public static downLoadTime: number = 10;
    /* 玩家自己座位号 */
    public static ownSet: number = 3;
    /* 几人牌局/默认3人局 */
    public static gameWay: number = 3;
    /* 特务牌黑桃A */
    public static spyCardA: number = 1;
    /* 首家出牌红桃4 */
    public static firstCardRedFour: number = 18;
    /* 出完牌顺序1,2,3 */
    public static finishOrderCount: number = 0;
    /* 头家 */
    public static finishFirst: number = 1;
    /* 二家 */
    public static finishSecound: number = 2;
}

/**
 * 游戏状态
 */
export enum GameState {
    Free = 0,//空闲
    LightDark = 1,//确定明暗特务状态
    Game = 2,//游戏中状态
    GameOver = 3,//游戏结束
}

/**
 * 牌型枚举
 */
export enum PukerType {
    Error = -1,//类型错误，
    Single = 0,//单张
    Double = 1,//对子
    ThreeByOne = 2,//三代一
    FourBytwoSingle = 3,//四带二带牌
    FourBytwoDouble = 4,//四带一对
}

/**
 * 提示信息
 * @param {string} info
 */
export function showTipsInfo(prefab: cc.Prefab, info: string) {
    console.log(info);
    let tipNode = NodePool.Instance.getNode(NodePool.PoolTipNode);
    if (!tipNode) {
        tipNode = cc.instantiate(prefab);
    }
    let script: TipNode = tipNode.getComponent(TipNode);
    script.showInfo(info);
    cc.director.getScene().addChild(tipNode);
}

/**
 * 错误消息枚举
 */
export enum ErrInfo {
    a = "无效牌型，请重新选择",
    b = "牌型错误，请重新选择",
    c = "出牌不能为空，请重新选择",
    d = "首家必须出牌",
}

/**
 * 明暗特务局枚举
 */
export enum GameSpyType {
    Light = 0,//明特务
    Dark = 1,//暗特务
}

/**
 * 游戏结果
 */
export enum GameResultType {
    Win = 0,//胜
    Peace = 1,//和
    Lose = 2,//负
}

export function generateName(): string {
    let names: any[] = [
        "烨磊君",
        "晟睿君",
        "文博君",
        "天佑君",
        "英杰君",
        "俊驰君",
        "雨泽君",
        "烨磊君",
        "伟奇君",
        "文博君",
        "天佑君",
        "文昊君",
        "修洁君",
        "黎昕君",
        "远航君",
        "旭尧君",
        "圣杰君",
        "鸿涛君",
        "荣轩君",
        "浩诚君",
        "子铭君",
        "玹霖君",
        "冠博君",
        "彦豪君",
        "泓杰君",
        "绍远君",
        "子羡君",
        "奕博君",
        "颢天君",
        "启博君",
        "博森君",
        "承颐君",
        "绍玮君",
        "熙诚君",
        "泽峻君",
        "浩铭君",]
    let na = names[Math.floor(Math.random() * names.length)]
    return na;
}