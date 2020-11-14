#!/usr/bin/env python
# -*- coding: utf-8 -*-
import GenCppCode
import sys

if __name__ == '__main__':
    GenCppCode.genClassAll(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4])