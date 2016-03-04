import serial
import time
#import getch
import tty, sys, termios
import readchar

ser = serial.Serial('/dev/ttyUSB2',115200,timeout=0)
out = ''
x = ''
while(1):

    while (ser.inWaiting()>0):
        out += ser.read(1)
    if "> " in out:
        print(out)
        out = ""
    x += getch()
    print(x)
    #x = ""
    if "\n" in x:
        print("ANYaD FASZA")
        ser.write(x)
        x = ""
