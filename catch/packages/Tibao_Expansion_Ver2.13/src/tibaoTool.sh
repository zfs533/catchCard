#!/bin/bash

creatAppIcon() {
  echo "\n正在制作App图标..."
  # 输出icon的目录
  icon_path=$(find ${projPath} -name AppIcon.appiconset)

  if [ ! -e "$icon" ]; then
    echo "icon路径出错，请检查！！！"
    return -1
  fi

  if [ ! -e "$icon_path" ]; then
    echo "icon输出路径出错，请检查！！！"
    return -1
  fi

  # 删除旧的
  rm -r "${icon_path}"
  mkdir "${icon_path}"

  # 1024 icon 直接复制
  icon_1024_path="${icon_path}/Icon-1024.png"
  cp "${icon}" "${icon_1024_path}"

  # 确保icon是1024*1024
  sips -z 1024 1024 ${icon_1024_path} >/dev/null 2>&1

  if [ ! -e "$icon_1024_path" ]; then
    echo "1024icon复制失败"
    echo ${icon}
    echo ${icon_1024_path}
    return -1
  fi

  #用于复制小图，减少内存消耗
  prev_size_path=${icon_1024_path}

  # 需要生成的图标尺寸
  icons=(20 40 57 60 80 120 180 72 144 76 152 167 50 100 29 58 87 114)
  #icons=(20)
  for size in ${icons[@]}; do
    size_path="${icon_path}/Icon-${size}.png"
    cp ${prev_size_path} ${size_path}
    sips -Z $size ${size_path} >/dev/null 2>&1
    sips -s format png ${size_path} --out ${size_path} >/dev/null 2>&1

    [ $? -eq 0 ] && echo "info:\tresize ${size} successfully." || echo "info:\tresize ${size} failed."
  done

  #1024更改为jpg
  sips -s format jpeg ${icon_1024_path} --out ${icon_1024_path} >/dev/null 2>&1
  [ $? -eq 0 ] && echo "info:\tresize 1024 to jpg successfully." || echo "info:\tresize 1024 to jpg  failed."

  # 复制图标对应的配置文件
  cp "$(dirname $0)/icon.json" "${icon_path}/Contents.json"
}

# 制作美宣图片
creatAppMeiXuan() {
  echo "\n正在制作美宣图片..."

  #美宣图的宽度
  meixSizeW=(2208 2688 2732)
  #美宣图的高度
  meixSizeH=(1242 1242 2048)

  out_path="${1}/美宣"
  mkdir -p $out_path

  count=1

  for file in $(ls $1); do
    if test -f "$1/${file}"; then
      sips -s format jpeg "$1/${file}" --out "$1/${file}"
    fi
  done

  for ((i = 0; i < ${#meixSizeW[@]}; i++)); do
    for file in $(ls $1); do
      if test -f "$1/${file}"; then
        #获得图片最终路径
        imgName="${meixSizeW[i]}*${meixSizeH[i]}_${count}.jpg"
        size_path="${out_path}/${imgName}"
        #复制图片
        cp "$1/${file}" ${size_path}
        #获取原图的宽高
        pixelWidth=$(sips -g pixelWidth "$1/${file}" | awk -F: '{print $2}')
        pixelHeight=$(sips -g pixelHeight "$1/${file}" | awk -F: '{print $2}')
        #根据原图的宽高比决定最后输出的横还是竖
        if test $pixelWidth -gt $pixelHeight; then
          sips -z ${meixSizeH[i]} ${meixSizeW[i]} ${size_path} >/dev/null 2>&1
        else
          sips -z ${meixSizeW[i]} ${meixSizeH[i]} ${size_path} >/dev/null 2>&1
        fi

        sips -s format jpeg ${size_path} --out ${size_path} >/dev/null 2>&1
        [ $? -eq 0 ] && echo "info:\tresize ${imgName} successfully." || echo "info:\tresize ${imgName} failed."
      fi
      ((count++))
    done
    ((count = 1))
  done
}

# 设置启动图片
setHealthDir() {
  echo "\n正在设置启动图片..."
  targetImage="${projPath}/build/jsb-default/frameworks/runtime-src/proj.ios_mac/ios/LaunchScreenBackground.png"

  if [ ! -e "$projPath" ]; then
    echo "项目路径不正确，请检查！"
    return -1
  fi

  if [ ! -e "$targetImage" ]; then
    echo "找不到启动图片路径，请检查项目是否构建"
    return -1
  fi

  if [ -e "$startImagePath" ]; then
    cp "$startImagePath" "$targetImage"
  else
    echo "找不到启动图片路径，请检查启动图片是否存在"
  fi

  rm -rf /Users/mac/Library/Developer/Xcode/DerivedData/*
  xattr -rc "${projPath}/build/jsb-default/frameworks/runtime-src/proj.ios_mac/"
}

openXcode() {
  echo "\n正在打开Xcode..."
  xcodeProjPath="${projPath}/build/jsb-default/frameworks/runtime-src/proj.ios_mac/*.xcodeproj"

  if [ ! -e "${projPath}/build/jsb-default/frameworks/runtime-src/proj.ios_mac/" ]; then
    echo "该项目路径下不存在Xcode项目文件，请检查项目路径是否正确及项目是否构建成功！"
    return -1
  fi

  open $xcodeProjPath
  echo "打开xcode成功"
}

#健康忠告的根目录
healthdir="/Users/mac/Documents/健康忠告"

case $1 in
"icon")
  echo "制作图标功能"
  #项目路径
  projPath=$2
  #图片路径
  icon=$3
  creatAppIcon
  ;;
"meix")
  echo "制作美宣功能"
  #美宣图文件夹路径
  meixPath=$2
  creatAppMeiXuan $meixPath
  ;;
"startI")
  echo "复制启动图功能"
  #项目路径
  projPath=$2
  #启动图路径
  startImagePath=$3
  setHealthDir
  ;;
"openXcode")
  #项目路径
  projPath=$2
  openXcode
  ;;
*)
  echo "请输入正确的命令"
  ;;
esac
