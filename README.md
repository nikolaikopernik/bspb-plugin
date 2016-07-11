# Costs analytics feature for BSPB's internet banking

Chrome extension for categorize all transactions in your statement.

## Install
1. Download
2. Install into chrome in development mode
3. Login into your internet bank account and go to the statement page (https://i.bspb.ru/statement)
4. Now you should have addition labels on each of yours transactions like this:
![asa](https://raw.githubusercontent.com/nikolaikopernik/bspb-plugin/master/info/pic2.png)

and an addition pie chart, like 
![asda](https://raw.githubusercontent.com/nikolaikopernik/bspb-plugin/master/info/pic1.png)
 
## Usage
1. To categorize your transactions you have to create new rules.
2. Each rule - is a pair of strings A & B (substring for **recipient** field and substring for **details** field of a transaction).  
3. To create a new rule just click on "other" label on a target transaction
![asa](https://raw.githubusercontent.com/nikolaikopernik/bspb-plugin/master/info/pic3.png)

## Rules examples
- **A="OKAY", B=""**   will affect all transactions with the word **OKAY** in recipient field.
- **A="", B="ШТРАФ"**   will affect all transactions with a word **ШТРАФ** in details.
- **A="SPB", B="Выдача наличных"**   will affect only transactions with the **SPB** word in recipient field and **Выдача наличных** in details
