let fs = require("fire-fs");
let path = require("fire-path");
let execSync = require('child_process').execSync;
let spawn = require('child_process').spawn;
let { promisify } = require('util')
let src_Path = "";

module.exports = {

    messages: {
        async openBuild() {
            Editor.Panel.open('tibao-tool');
        },

        /**
         * 构建项目的消息
         * @param  {...any} args 参数
         */
        async buildProj(event, ...args) {
            src_Path = Editor.url("packages://tibao-tool/src/", 'utf8');

            let ccpath = path.join(Editor.App.path.replace('/Resources/app.asar', ''), 'MacOS/CocosCreator');
            let iconPath = args[0];
            let startPath = args[1];
            let projName = args[2];
            let buildScene = args[3];
            let xxteaKey = args[4].replace('$', '\\$');
            let lajiPaths = args[5];
            let jmOp = args[6];
            let orientation = args[7];
            let openXcode = args[8];
            let isMd5 = args[9];
            let hotUpdateM = args[10];
            let IsModifyClass = args[11];
            let cppParam = args[12];
            let isRename = args[13];
            let IsModifyEngine = args[14];
            let meixPath = args[15];
            let isXXtea = xxteaKey === "";
            let projPath = Editor.assetdb.urlToFspath("db://assets/").replace('assets', '');
            let command = `${ccpath} --path ${projPath} --build "buildPath="build/";platform=ios;debug=false;title=${projName};inlineSpriteFrames=false;optimizeHotUpdate=false;template=default;encryptJs=${!isXXtea};xxteaKey=${xxteaKey};zipCompressJs=false;mergeStartScene=true;startScene=${buildScene};md5Cache=false";orientation={'landscapeLeft':${orientation.landscapeLeft},'landscapeRight':${orientation.landscapeRight},'portrait':${orientation.portrait},'upsideDown':${orientation.upsideDown}}`;

            await recopyScript(projPath)

            print("正在构建，请稍后......", 's');
            Editor.Ipc.sendToPanel("tibao-tool", "setBuild", true);
            await shell(command);
            print("初步构建完成", 's');


            if (iconPath && projPath) await ChangeIcon(iconPath, projPath);
            if (iconPath && projPath) await ChangeStartImage(startPath, projPath);
            if (meixPath && projPath) await GenerateMeixImage(meixPath, projPath);
            if (isMd5 && projPath) await ModifyMd5(projPath, projName);
            if (jmOp && projPath) await EncryptionFile(jmOp, path.join(projPath, "build/jsb-default"));
            if (lajiPaths && projPath) await GenInvalidFile(lajiPaths, path.join(projPath, "build/jsb-default"));
            if (hotUpdateM !== "null" && projPath && hotUpdateM === "193") await HotUpdate_193(projPath);
            if (hotUpdateM !== "null" && projPath && hotUpdateM === "209") await HotUpdate_209(projPath);
            if (IsModifyClass && projPath) await ModifyClass(projPath);
            if (IsModifyEngine && projPath) await ModifyEngine(projPath);
            if (projPath && projPath) await setComp();
            // if (isRename && projPath) await rename(projPath)

            if (cppParam !== "null" && cppParam !== "") {
                // let prmlst = cppParam.split(',')
                // if (prmlst.length >= 2) {
                //     let clsn = parseInt(prmlst[0]);
                //     let datn = parseInt(prmlst[1]);
                //     await GenCppCode(projPath, projName, clsn, datn);
                // }else {
                //     print("生成C++类：参数错误！");
                // }
                let clsn = parseInt(cppParam)
                if (clsn > 0) {
                    await GenCppCode(projPath, projName, clsn, clsn);
                } else {
                    print("生成C++类：参数错误！请输入整数");
                }
            } else {
                print("C++参数为空，不需要生成C++类！")
            }




            Editor.Ipc.sendToPanel("tibao-tool", "setBuild", false);
            Editor.Ipc.sendToPanel("tibao-tool", "save");
            print("操作已经全部完成", 's');

            if (openXcode && projPath) OpenXcode(projPath);
        },

        /**
         * 打开Xcode（主菜单入口）
         */
        openXcode() {
            let projPath = Editor.assetdb.urlToFspath("db://assets/").replace('assets', '');
            if (!fs.existsSync(path.join(projPath, 'build/jsb-default/frameworks/runtime-src/proj.ios_mac'))) {
                Editor.failed("没有构建怎么打开Xcode呢？");
                return;
            }
            OpenXcode(projPath);
        },

        /**
         * 删除build目录
         */
        async delBuild() {
            let projPath = Editor.assetdb.urlToFspath("db://assets/").replace('assets', '');
            let buildPath = path.join(projPath, "build");
            if (fs.existsSync(buildPath)) {
                await shell(`rm -rf ${buildPath}`);
                print("已删除budile目录", 's');
            } else {
                print("没有构建怎么删除budile呢？", 'f');
            }
        },
    },
};

/**
 * 资源重命名
 * @param {*} projPath 项目目录 
 */
async function rename(projPath) {
    return new Promise(async resolve => {
        let res = path.join(projPath, "build/jsb-default/res")
        let src = path.join(projPath, "build/jsb-default/src")
        let script = path.join(projPath, "build/jsb-default/frameworks/cocos2d-x/cocos/scripting/js-bindings/script")
        let key = Math.random().toString(36).substr(2).slice(0, 16)
        let keycode = key.match(/./g).join("','");
        let newscript = "int key[] = {'" + keycode + "'};";
        await shell(`python encryptionName.py ${key} ${res}`, 's')
        await shell(`python encryptionName.py ${key} ${src}`)
        await shell(`python encryptionName.py ${key} ${script}`)
        let srcPath = path.join(projPath, '/build/jsb-default/frameworks/cocos2d-x/cocos/custom/Encryption.h')
        try {
            let script = fs.readFileSync(srcPath, "utf-8")
            var regex = /int key\[\] =.+.;/;
            script = script.replace(regex, newscript)
            let writeFile = promisify(fs.writeFile);
            await writeFile(srcPath, script);
        } catch (error) {
            print(error, 'f')
            resolve()
        }

        print("资源重命名完成", 's')
        resolve();
    })
}

/**
 * 重新拷贝Script文件夹
 * @param {*} projPath 项目目录
 */
async function recopyScript(projPath) {
    return new Promise(async resolve => {
        let projScriptPath = path.join(projPath, "build/jsb-default/frameworks/cocos2d-x/cocos/scripting/js-bindings/script");
        let cccScriptPath = Editor.App.path.replace('app.asar', 'cocos2d-x/cocos/scripting/js-bindings/script');
        if (fs.existsSync(projScriptPath)) {
            await shell(`rm -rf ${projScriptPath}`)
            await shell(`cp -r ${cccScriptPath} ${projScriptPath}`)
        }
        resolve();
    })
}

/**
 * 设置icon
 * @param {*} iconPath icon路径
 * @param {*} projPath 项目路径
 * @param {*} options 构建信息
 * @param {*} callback 继续执行后面的操作
 */
async function ChangeIcon(iconPath, projPath) {
    return new Promise(async resolve => {
        print("开始设置icon")

        let command = `sh tibaoTool.sh icon ${projPath} "${iconPath}"`;
        await shell(command);

        print('设置icon成功', 's');
        resolve();
    })
}

/**
 * 设置启动图
 * @param {*} startPath 启动图路径
 * @param {*} projPath 项目路径
 * @param {*} options 构建信息
 * @param {*} callback 继续执行后面的操作
 */
async function ChangeStartImage(startPath, projPath) {
    return new Promise(async resolve => {
        print("开始设置启动图片");

        let command = `sh tibaoTool.sh startI ${projPath} "${startPath}"`;
        await shell(command);

        print("设置启动图成功", 's');
        resolve();
    })
}

/**
 * 制作美宣图
 * @param {*} meixPath 美宣图路径
 * @param {*} projPath 项目路径
 * @param {*} options 构建信息
 * @param {*} callback 继续执行后面的操作
 */
async function GenerateMeixImage(meixPath, projPath) {
    return new Promise(async resolve => {
        print("开始制作美宣图");
        let command = `sh tibaoTool.sh meix ${meixPath}`
        await shell(command)
        print("制作美宣图成功", 's');
        resolve();
    })
}

/**
 * 目标文件夹及子文件夹下添加垃圾文件
 * @param {*} paths 垃圾文件夹选项，保存了垃圾文件数量因子及文件夹信息
 * @param {*} rootPath 根目录
 */
async function GenInvalidFile(paths, rootPath) {
    return new Promise(async resolve => {

        let command;

        if (paths.res) {
            print("正在res文件夹下面添加垃圾文件");
            command = `python genfile.py ${path.join(rootPath, 'res')} ${paths.factor}`;
            await shell(command, 's');
        }

        if (paths.src) {
            print("正在src文件夹下面添加垃圾文件");
            command = `python genfile.py ${path.join(rootPath, 'src')} ${paths.factor}`;
            await shell(command, 's');
        }
        let scriptPath = path.join(rootPath, 'frameworks/cocos2d-x/cocos/scripting/js-bindings/script');
        if (paths.script && fs.existsSync(scriptPath)) {
            print("正在script文件夹下面添加垃圾文件");

            command = `python genfile.py ${scriptPath} ${paths.factor}`;
            await shell(command, 's');
        } else {
            print("script文件夹不存在，无需添加垃圾文件");
        }

        resolve()
    })
}

/**
 * 目标文件夹及子文件夹下加密文件
 * @param {*} paths 加密文件夹选项
 * @param {*} rootPath 根目录
 */
async function EncryptionFile(paths, rootPath) {
    return new Promise(async resolve => {

        let command;
        let pass = Math.random().toString(16).substr(2).slice(0, 8) + Math.random().toString(16).substr(2).slice(0, 8) + Math.random().toString(16).substr(2).slice(0, 8) + Math.random().toString(16).substr(2).slice(0, 8);

        if (paths.res) {
            print("正在加密res文件夹下面大部分文件");
            command = `python encryption.py ${path.join(rootPath, 'res')} 0 ${pass}`;
            await shell(command);
            print("res文件夹下的文件加密成功", 's');
        }

        if (paths.src) {
            print("正在加密src文件夹下面大部分文件");
            command = `python encryption.py ${path.join(rootPath, 'src')} 0 ${pass}`;
            await shell(command);
            print("src文件夹下的文件加密成功", 's');
        }

        let scriptPath = path.join(rootPath, 'frameworks/cocos2d-x/cocos/scripting/js-bindings/script');
        if (paths.script && fs.existsSync(scriptPath)) {

            print("正在加密script文件夹下面大部分文件");
            command = `python encryption.py ${scriptPath} 0 ${pass}`;
            await shell(command);
            print("script文件夹下的文件加密成功", 's');
        } else {
            print("script 文件夹不存在，无需加密");
        }

        let jsb_adapter = path.join(rootPath, 'jsb-adapter');
        if (paths.script && fs.existsSync(jsb_adapter)) {
            print("正在加密jsb-adapter文件夹下面大部分文件");
            command = `python encryption.py ${jsb_adapter} 0 ${pass}`;
            await shell(command);
            print("jsb-adapter文件夹下的文件加密成功", 's');
        } else {
            print("jsb-adapter 文件夹不存在，无需加密 === " + jsb_adapter);
        }

        if (!paths.res && !paths.src && !paths.script) { resolve(); return }

        // 文件路径
        let srcPath = path.join(Editor.url("db://assets"), '../build/jsb-default/frameworks/cocos2d-x/cocos/custom/Encryption.h')
        let script = fs.readFileSync(srcPath, "utf-8")
        var pattern = /static.+.;/;
        script = script.replace(pattern, `static const char* g_password = "${pass}";`)
        try {
            let writeFile = promisify(fs.writeFile);
            await writeFile(srcPath, script);
        } catch (error) {
            print(error, 'f')
            resolve()
        }

        resolve();
    })
}

/**
 * 打开Xcode
 * @param {*} projPath 
 */
async function OpenXcode(projPath) {
    let command = `sh tibaoTool.sh openXcode ${projPath}`;
    print(command)
    try {
        await shell(command);
    } catch (error) {
        print(error, 'f')
    }
}

/**
 * 修改文件MD5
 * @param {*} projPath 项目路径
 * @param {*} title 项目名称
 */
async function ModifyMd5(projPath, title) {
    return new Promise(async resolve => {
        print("修改文件md5值");

        let resPath = path.join(projPath, "build/jsb-default/res");
        let command = `sh md5.sh ${resPath} ${title}`;
        await shell(command);

        print("修改md5成功", 's');
        resolve();
    })
}

/**
 * 热更新main.js添加搜索路径 版本1.9.3
 */
async function HotUpdate_193(projPath) {
    return new Promise(async resolve => {
        print("开始cocos creator 1.9.3版本修改main.js文件");

        var mainJsPath = path.join(projPath, 'build/jsb-default/main.js');  // 获取发布目录下的 main.js 所在路径
        var script = fs.readFileSync(mainJsPath, 'utf8');     // 读取构建好的 main.js
        let mergeCode =
            `(function () {
            if (cc.sys.isNative) { 
                let path = cc.sys.localStorage.getItem('SearchPaths'); 
               if (path) jsb.fileUtils.setSearchPaths(JSON.parse(path));
            }`;

        script = script.replace("(function () {", mergeCode);
        let writeFile = promisify(fs.writeFile);
        try {
            await writeFile(mainJsPath, script);
        } catch (error) {
            print(error, 'f')
        }

        print("cocos creator 1.9.3版本修改main.js文件成功", 's');
        resolve();
    })
}

/**
 * 热更新main.js添加搜索路径 版本2.0.9
 */
async function HotUpdate_209(projPath) {
    return new Promise(async resolve => {
        print("开始cocos creator 2.0.9版本修改main.js文件");

        var mainJsPath = path.join(projPath, 'build/jsb-default/main.js');  // 获取发布目录下的 main.js 所在路径
        var script = fs.readFileSync(mainJsPath, 'utf8');     // 读取构建好的 main.js
        let mergeCode =
            `var isRuntime = (typeof loadRuntime === 'function');
        let path = window.sys.localStorage.getItem('SearchPaths');
        if (path) jsb.fileUtils.setSearchPaths(JSON.parse(path));`;

        script = script.replace("var isRuntime = (typeof loadRuntime === 'function');", mergeCode);         // 添加一点脚本到
        let writeFile = promisify(fs.writeFile);
        try {
            await writeFile(mainJsPath, script);
        } catch (error) {
            print(error, 'f')
        }

        print("cocos creator 2.0.9版本修改main.js文件成功", 's');
        resolve();
    })
}

/**
 * 修改类名
 * @param {*} projPath 项目路径
 */
async function ModifyClass(projPath) {
    return new Promise(async resolve => {
        print("开始修改类名");
        var cocosPath = path.join(projPath, 'build/jsb-default/frameworks/cocos2d-x');
        if (!fs.existsSync(path.join(cocosPath, 'cocos/custom/CustommooZiDiYi.mm'))) {
            print("操作被禁止，不允许多次修改类名", 'f');
            resolve();
            return;
        }
        let command = `source ~/.bash_profile \n cd ${cocosPath}\n python ModifyClass.py`;
        await shell(command);
        print("修改类名成功", 's');
        resolve();
    })
}

/**
 * 混淆引擎源代码
 * @param {项目路径 string} projPath 
 */
async function ModifyEngine(projPath) {
    return new Promise(async resolve => {
        print("开始混淆引擎源代码")
        let enginPath = path.join(projPath, 'build/jsb-default/frameworks');
        if (fs.existsSync(path.join(enginPath, 'origin/'))) {
            print("操作被禁止，不允许多次修改引擎源代码", "f");
            resolve();
            return;
        }
        let command = `python engineGarbage.py ${enginPath}/cocos2d-x/cocos ${enginPath}/origin`;
        await shell(command);
        print("混淆引擎源代码成功", "s");
        resolve();
    });
}


/**
 * 生成C++类
 * @param {*} projPath 项目路径
 * @param {*} projectName 项目名称
 * @param {*} classNumber 类个数
 * @param {*} dataNumber 静态数据个数
 */
async function GenCppCode(projPath, projectName, classNumber, dataNumber) {
    return new Promise(async resolve => {
        print("开始生成C++类");
        var cocosPath = path.join(projPath, 'build/jsb-default/frameworks/cocos2d-x');
        if (fs.existsSync(path.join(cocosPath, 'cocos/out/'))) {
            print("操作被禁止，不允许多次生成C++类", 'f');
            resolve();
            return;
        }

        command = `cd gencpp\n python GenMain.py ${projectName} ${classNumber} ${dataNumber} ${projPath}`;
        await shell(command);

        print("生成C++类成功", 's');
        resolve();
    })
}

async function setComp() {
    return new Promise(async resolve => {

        let builderJsonPath = path.join(Editor.url("db://assets"), '../settings/hotUpdateComp.json')
        if (!fs.existsSync(builderJsonPath)) { resolve(); return; }

        var data = fs.readFileSync(builderJsonPath, "utf-8")
        let buildJson = JSON.parse(data)
        if (buildJson.HotUpdateCompFileName && buildJson.TargetPath) {
            print("正在复制压缩文件", 's')
            let command = `cp -Rf ${buildJson.HotUpdateCompFileName}/* ${buildJson.TargetPath}`;
            await shell(command)
            print("压缩文件复制成功", 's')
            await ModifyInfo(buildJson.zipHeadStr, buildJson.zipPass)
            resolve()
        }
        resolve()
    })
}


/**
 * 在代码中修改压缩包相关的信息，如：密码、压缩包文件头
 * @param {*} zipHeadStr 文件头
 * @param {*} zipPass 密码
 */
async function ModifyInfo(zipHeadStr, zipPass) {
    return new Promise(async resolve => {

        // 文件夹路径
        let srcPath = path.join(Editor.url("db://assets"), '../build/jsb-default/frameworks/cocos2d-x/cocos/custom/')

        // 修改文件头
        let byteCommand = `find ${srcPath}  -name "*.mm" | xargs grep "origByte\\[\\]"`;
        let byteInfo = await shell(byteCommand, 'n')

        let script = fs.readFileSync(byteInfo.split(":")[0], "utf-8")
        script = script.replace(byteInfo.split(":")[1], `const Byte origByte[] = ${zipHeadStr}`)

        // 修改密码
        let passCommand = `find ${srcPath}  -name "*.mm" | xargs grep "*password"`;
        let passInfo = await shell(passCommand, 'n')
        script = script.replace(passInfo.split(":")[1], `NSString *password = @"${zipPass}";\n`)

        try {
            let writeFile = promisify(fs.writeFile);
            await writeFile(byteInfo.split(":")[0], script);
        } catch (error) {
            print(error, 'f')
            resolve()
        }

        resolve()
    })
}

/**
 * 异步shell命令执行
 * @param {*} command 命令内容
 */
async function shell(command, type = 'l') {
    return new Promise(resolve => {
        let buffer = ""
        try {
            var sh = spawn('/bin/bash', ['-c', command], { cwd: src_Path });
        } catch (error) {
            print(error, 'f')
        }

        sh.stdout.on('data', function (data) {
            if (type !== 'n') print(data.toString(), type);
            buffer += data.toString()
        });

        sh.stdout.on('error', function (data) {
            print("[error]:" + data.toString(), 'f');
        });


        sh.stdout.on('end', () => resolve(buffer));
    })
}
/**
 * 同步命令执行，会阻塞
 * @param {*} command 命令内容
 */
function shellSync(command, type = 'l') {
    let result = execSync(command, { cwd: src_Path, shell: "/bin/bash" }).toString();
    print(result, type);
}

/**
 * 打印
 * @param {*} data 打印内容
 * @param {*} type 类型:l 普通日志，s 成功日志，f 失败日志
 */
function print(data, type = 'l') {
    switch (type) {
        case "l":
            Editor.log(data);
            break;
        case "s":
            Editor.success(data);
            Editor.Ipc.sendToPanel("tibao-tool", "setlog", data);
            break;
        case "f":
            Editor.failed(data);
            break;
        default:
            break;
    }
}
