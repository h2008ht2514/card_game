// 原本的寫法
// const view = {
//   displayCards: function displayCards() { ...  }
// }
// // 省略後的寫法
// const view = {
//   displayCards() { ...  }
// }
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}




const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardElement(index) {
    // back
    return `
    <div class="card back" data-index="${index}"></div>
    `
  },
  // 注意，現在 getCardElement 產生的 HTML 裡沒有 index 參數了，所以等下我們要做額外的處理來讓 getCardContent 得到卡片編號。

  // front 
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    // console.log(number)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
      <p>${number}</p>
        <img src="${symbol}">
      <p>${number}</p>
    `
  },


  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  //Array.from(Array(52).keys())
  // indexes: 請controller call洗牌function
  displayCards(indexes) {
    // const rootElement = document.querySelector('#cards');
    // rootElement.innerHTML = Array.from(Array(52).keys()).map(index => 
    //   this.getCardElement(index)).join("")
    const rootElement = document.querySelector('#cards');
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index))
      .join("")
  },


  // 有的時候只翻一張牌，有的時候要翻兩張牌，也就是說傳給 flipCard 的參數有可能是 1 個數字，也有可能是含有 2 個數字的陣列。
  // 資料結構不同，如何用同一個函式來處理呢？
  flipCards(...cards) {
    // console.log(card.dataset.index)

    //back-> front
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // front-> back
      card.classList.add('back')
      card.innerHTML = null //can i use '' instad of null?
      console.log(card)
      // Yes, you can use an empty string '' instead of null for the card.innerHTML assignment. Both null and an empty string '' will clear the content of the HTML element.
    })

    // if (card.classList.contains('back')) {
    //   card.classList.remove('back')
    //   card.innerHTML = this.getCardContent(Number(card.dataset.index))
    //   return
    // }

    //front-> back
    // card.classList.add('back')
    // card.innerHTML = null
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })

  },

  renderScore(score) {
    document.querySelector('.score').innerText = `your score: ${model.score}`

  },
  renderTriedTimes(times) {
    document.querySelector('.tried').innerText = `You've tried ${model.triedtimes} times.`

  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {
        event.target.classList.remove('wrong'), { once: true }
      })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p> Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedtimes} times.</p>
    `
    const header = document.querySelector('#header')
    header.before(div)

  }
}

const utility = {
  getRandomNumberArray(count) {
    // 生成連續數字陣列
    // if count = 7 , numeber = [0,1,2,3,4,5,6]
    const number = Array.from(Array(count).keys())

    // 選定想交換的位置
    let index = number.length - 1  //取出最後一項 ex: 52-1 = 51
    let randomIndex = Math.floor(Math.random() * index + 1) //找到一個隨機項目 51 + 1 =52

    // 從底下洗回來 洗到哪張?第二張
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * index + 1)

        //交換陣列元素
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
      // ;[] 來把執行語句隔開
      // 因為前面呼叫了 Math.floor() 這個函式庫，如果沒有加上分號，會和後面的 [] 連起來，被解讀成 Math.floor()[]，雖然沒有實際的意義，但因為瀏覽器對 JavaScript 的語法解析很寬鬆，這裡會發生錯誤，所以需要加上分號變成 Math.floor();[] 來把執行語句隔開。

    }
    return number
  }
}


// view.displayCards()
// console.log(utility.getRandomNumberArray(52))


const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    // 檢查
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(model.triedtimes += 1)


        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷是否配對成功
        if (model.isRevealedCardsMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          // view.pairCard(model.revealedCards[0])
          // view.pairCard(model.revealedCards[1])
          view.pairCards(...model.revealedCards)
          // console.log(...model.revealedCards)
          // 印出兩個 <div class="card paired" data-index="41"></div>
          // <div class="card paired" data-index="2"></div>
          model.revealedCards = [] //清空
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished() //新增
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
          // setTimeout(() => {this.resetCards
          //   // view.flipCard(model.revealedCards[0])
          //   // view.flipCard(model.revealedCards[1])
          //   view.flipCards(...model.revealedCards) // 不用加括號
          //   // console.log(...model.revealedCards)
          //   // 印出兩個 <div class="card back" data-index="42"></div>
          //   // <div class="card back" data-index="40"></div>

          //   model.revealedCards = [] //清空
          //   this.currentState = GAME_STATE.FirstCardAwaits         
          // }, 1000);
          this.currentState = GAME_STATE.FirstCardAwaits
        }
        break
    }
    console.log('this.currentstate:', this.currentState)
    console.log('revealCards:', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards) // 不用加括號
    model.revealedCards = [] //清空能用'' 或null麼
    controller.currentState = GAME_STATE.FirstCardAwaits
    console.log(this) //如果用this.currentState的話 this會指向瀏覽器[object Window]
    //Ans:You should use an empty array [] to clear the contents of model.revealedCards because it is an array, and assigning '' or null wouldn't make sense in this context. An array is an ordered collection of elements, and using [] is the correct way to clear its contents.

  }
}
// 由 controller 啟動遊戲初始化，在 controller 內部呼叫 view.displayCards
// 由 controller 來呼叫 utility.getRandomNumberArray，避免 view 和 utility 產生接觸
// .map(card => card.dataset.index): This part applies the map function to each element (card) in the model.revealedCards array. The map function transforms each card into its dataset.index value.
// The key difference is that map is used when you want to transform each element of an array and create a new array with the results
// , while forEach is used when you want to iterate over the elements of an array and perform some action for each element without creating a new array.

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    // console.log(this.revealedCards[0]) // 印出<div class="card back" data-index="49"></div>
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  // 這是屬於資料的管理，所以要在 model 裡增加資料屬性：
  score: 0,
  triedtimes: 0
  // 接著到 view 新增 renderScore 與 renderTriedTimes 兩個函式，選取前面新增的 .score 與 .tried，將分數渲染出來：

}
// 暫存牌組，使用者每次翻牌時，就先把卡片丟進這個牌組，集滿兩張牌時就要檢查配對有沒有成功，檢查完以後，這個暫存牌組就需要清空。


controller.generateCards()
const flipCardTarget = document.querySelectorAll('.card')
flipCardTarget.forEach(card => {
  card.addEventListener('click', event => {
    // console.log(event.target)
    controller.dispatchCardAction(card)
    // view.showGameFinished()
    

  })
})