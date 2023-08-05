

def convertCurrency(lists,startingcur,endingCur):
    rate1=0
    rate2=0
    
    start = {"to": "JPY", "rate": 0.0070}
    JPY = {"to": "USD", "rate": 110}
    USD = {"to": "AUD", "rate": 1.45}
    print("the number is " + str(start["rate"]))
    for list in lists:
        if(startingcur==list[1]):
            rate1=list[2]
        if(endingCur==list[1]):
            rate2=list[2]
    return 0

print(convertCurrency([["USD","JPY",110],["USD","AUD",1.45],["JPY","GBP",0.0070]],"GBP","AUD"))