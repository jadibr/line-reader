# Task

You are given a very, very large plain text file where each line contains a plain
text string. The file has at most 1 billion lines; lines may have different lengths,
but each line has at most 1000 characters. Your goal is to write a program that
will print an arbitrary line from the file. Your program will be run many times
(although you don't know exactly how many times it will be run in advance), and
you don't know in advance which lines might be selected. Thus, your solution
should be optimized to minimize the runtime for each additional execution. The
first execution of the program may take longer than subsequent runs, and you
may use additional disk storage to improve performance.
Your program should take two command-line arguments: the path of the input
file from which to print lines, and the index of the line you want to print. Your
program should write the line to standard output.

# Assumptions
1. The file does not end with a new (empty) line
2. Index is generated only based on the file name (not file hash for example). This is important if the content of the input file changes because index won't be refreshed
3. This software was tested only on Linux

# Parameters
1. Absolute input file path
2. Line number
3. Flag for overwriting index file even if it already exists. Defaults to `false` and is optional. Set to `true` if you wish to overwrite