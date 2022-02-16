/**
 * @param {number} n
 * @return {number}
 */
let totalMoney = function (n) {
  let curMoney = 0;
  let moneyAdd = 1;
  let week = 0;
  for (let i = 0; i < n; i++) {
    console.log(`当前星期 ${week} 应加存款 ${moneyAdd} 当前存款 ${curMoney} `)
    curMoney += moneyAdd;
    if (week === 6) {
      moneyAdd -= 6;
      week -= 7;
    }
    moneyAdd++;
    week++;
  }
  return curMoney;
};

let res = totalMoney(15)
console.log(res)