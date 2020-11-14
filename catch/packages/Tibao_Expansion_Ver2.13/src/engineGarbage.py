#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
    生成垃圾函数代码
    原理：向cpp源文件中插入垃圾代码，不影响原代码功能
    使用方法：在项目同级目录打开终端执行 python engineGarbage.py
        第一步：备份原文件
        第二部：植入垃圾代码
"""
import random
import string
import os
import sys
import shutil


def createGarbage():
    """
        生成垃圾代码
        返回值：
            垃圾代码字符串
    """
    rd = random.randint(10, 20)
    varName = ''.join(random.sample(string.ascii_letters, rd))
    rdm = random.randint(8, 20)
    funcName = ''.join(random.sample(string.ascii_letters, rdm))
    value = random.randint(0, 10000)
    codes = "\nvoid %s(){\n\tint %s = %d;\n}\n" % (funcName, varName, value)
    return codes


def dealFile(ffile):
    """ 
        读写文件操作，写入垃圾代码
        参数：
            ffile:文件路径string
    """
    contentList = []
    for line in open(ffile):
        index1 = line.find("::")
        index2 = line.find("void")
        if index1 > -1 and index2 == 0:
            contentList.append(createGarbage())
        contentList.append(line)
    rds = random.randint(1, 10)
    for i in range(rds):
        contentList.append(createGarbage())

    """ 先清空再写入 """
    fil = open(ffile, "r+")
    fil.truncate()
    fil = open(ffile, "a")
    for content in contentList:
        fil.write(content)
    fil.close()


def batchCopy(paths, destination):
    """
        备份原始文件
    """
    isExists = os.path.exists(destination)
    """ 只有第一次的时候备份，无需重复备份 """
    if not isExists:
        shutil.copytree(paths, destination)


if __name__ == '__main__':
    """
        遍历目录下的所有cpp文件
    """
    paths = sys.argv[1]
    origin = sys.argv[2]
    batchCopy(paths, origin)
    for root, dirs, files in os.walk(paths):
        for k in files:
            length = len(k)
            extents = k[length-4:length]
            if(extents == ".cpp"):
                dealFile(root+"/"+k)
