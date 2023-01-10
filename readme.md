# SmartContract reentrancy attack demonstration

 This is demonstration about reentrancy attack and how to prevent it.

## How to run
1. Clone
2. Install dependencies
```
$ npm install
```
3. Test 
```
npx hardhat test
```

## Article and discussions about transfer, send and call

You can find an article about transfer, send and call here https://medium.com/coinmonks/solidity-transfer-vs-send-vs-call-function-64c92cfc878a

You can find discussion about this title here https://ethereum.stackexchange.com/questions/19341/address-send-vs-address-transfer-best-practice-usage

I have a conclution; `transfer` method still safe
```
payable(msg.sender).sendValue(depositedAmount);       // not safe
payable(msg.sender).transfer(depositedAmount);        // SAFE
payable(msg.sender).call{value: depositedAmount}(''); // not safe
```