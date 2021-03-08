import subprocess

def send_on_jtag(cmd):
    # this setup will only send chars, if you want to change this, 
    # you need to modify the code running on the NIOS II to have 
    # the variable prompt accept multiple chars.
    # assert len(cmd)==1, "Please make the cmd a single character"

    inputCmd = "nios2-terminal --flush <<< {}".format(cmd)

    # subprocess allows python to run a bash command
    process = subprocess.Popen(inputCmd, shell=True, executable='/bin/bash', bufsize=1, universal_newlines=True, stdout=subprocess.PIPE)

    while True:
        output = process.stdout.readline()
        if process.poll() is not None:
            break
        if output:
            print(output.strip(), end='\n')
    rc = process.poll()
    return rc


    # vals = output.stdout
    # vals = vals.decode("utf8")
    # vals = vals.split('<-->')
    # for val in vals[1:]:
        # print(val.split('<--->')[0].strip(), end = ',')
    # print('\n')

def main():
    # put your code here ...
    while(True):
        n = int(input('Please enter a number: '))
        if (n==0):
            return
        send_on_jtag(n)
    
if __name__ == '__main__':
    main()
