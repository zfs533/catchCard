#! /bin/bash

function modify_md5() {
    for file in $(ls $1); do
        if [ -d $1"/"$file ]; then #注意此处之间一定要加上空格，否则会报错
            modify_md5 $1"/"$file
        else
            case "${file#*.}" in
            # "json")
            #     modifyToJson $1"/"$file
            #     ;;
            # "jpg")
            #     modifyToJpg $1"/"$file
            #     ;;
            # "png")
            #     modifyToPng $1"/"$file
            #     ;;
            # "webp")
            #     modifyToWedp $1"/"$file
            #     ;;
            "mp3")
                modifyToMp3 $1"/"$file
                ;;
            esac
        fi
        sleep 0.01s
    done
}

modifyToJpg() {
    echo "处理jpg文件: $1"
    echo $vaule >>$1
}

modifyToWedp() {
    echo "处理webp文件: $1"
    echo $vaule >>$1
}

modifyToPng() {
    echo "处理png文件: $1"
    echo $vaule >>$1
    # convert $1 $1
}

modifyToJson() {
    echo "处理json文件: $1"
    str="{"
    targetStr="{\"${key}\"":\"${vaule}\"","
    sed -i "" "s/${str}/${targetStr}/" $1
}

modifyToMp3() {
    # lame -mm -V9 $1 $1"_"
    # rm -f $1
    # mv $1"_" $1
    #name=$(openssl rand -base64 64 | tr -cd 'a-zA-Z' | head -c 12 | awk -F: '{print $1}')
    echo "处理mp3文件: $1"
    echo $vaule >>$1
}

encrypt_string() {
    vaule=$(echo $1 | base64)
    vaule=$(echo $vaule | xxd -ps -u | awk -F: '{print $1}')
    vaule=$(echo "ibase=16; $vaule" | bc | awk -F: '{print $1}')
}

if [ -e "$1" ]; then
    key=$2
    encrypt_string $key
    modify_md5 $1
else
    echo 'path not found'
    exit -1
fi
