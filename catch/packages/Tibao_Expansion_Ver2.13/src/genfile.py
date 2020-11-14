#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import os.path
import random
import string
import word
import base64

# 后缀列表
suffix_list = ['jpg', 'png', 'webp', 'luac',
               'mp3', 'bmp', 'xml', 'ini', ]

# 随机因子，控制整体随机数量
random_num = 0.7

# 垃圾文件数量
file_count = 0

# 垃圾文件大小
file_size = 0

# 文件夹数量
dir_count = 0


def getContent():
    """
    生成文件内容
    """
    global file_size

    size = random.randint(1024, 3 * 1024)
    str1 = base64.b64encode(os.urandom(size))
    file_size += size
    return str1


def getFileName():
    """
    生成文件名
    """
    str1 = random.choice(word.word)
    str2 = random.choice(word.word)
    str3 = random.choice(suffix_list)
    return str1 + str2.capitalize() + '.' + str3


def getDirName():
    """
    生成文件夹名
    """
    str1 = random.choice(word.word)
    str2 = random.choice(word.word)
    return str1 + str2.capitalize()


def creat_filesize(path):
    """
    创建文件
    """
    global file_count

    file_name = path + "/" + getFileName()
    bigFile = open(file_name, 'w')
    # bigFile.seek(1024 * )
    bigFile.write(getContent())
    bigFile.close()
    file_count += 1


def creator_dir(path):
    """
    创建文件夹
    """
    global dir_count

    dir_name = os.path.join(path, getDirName())
    folder = os.path.exists(dir_name)
    if not folder:
        os.makedirs(dir_name)
    dir_count += 1


def get_file_count(path):
    """
    获取文件夹下面的文件数量，不包含字子文件夹
    """
    count = 0
    for file in os.listdir(path):
        if not os.path.isdir(os.path.join(path, file)):
            count += 1
    return count


def run_laji(path):
    """
    运行生成垃圾文件
    """

    file_count = get_file_count(path)
    if (file_count != 0):
        file_count *= int(random.randint(1, 3) * random_num)
    else:
        file_count = int(random.randint(3, 6) * random_num)
    for item in range(1, file_count):
        creat_filesize(path)


if __name__ == '__main__':
    rootDir = sys.argv[1]
    factor = float(sys.argv[2])
    dir_list = []

    global random_num
    random_num = factor

    for parent, dirnames, filenames in os.walk(rootDir):
        for dirname in dirnames:
            path = os.path.join(parent, dirname)
            dir_list.append(path)

    dir_list.append(rootDir)
    for d in dir_list:
        if 'import' in d:
            continue
        for item in range(1, int(random.randint(10, 15) * random_num)):
            creator_dir(d)

    run_laji(rootDir)
    for parent, dirnames, filenames in os.walk(rootDir):
        for dirname in dirnames:
            path = os.path.join(parent, dirname)
            run_laji(path)

    print('已经在 %s 目录下生成垃圾文件 %s 个, 垃圾文件夹 %s 个, 共计大小 %s kB' %
          (rootDir, file_count, dir_count, file_size / 1024))
