const CELL_SIZE = 30;
const WALL_CELL_ID = 0;
const EMPTY_CELL_ID = 1;
const HEALTH_CELL_ID = 4;
const SWORD_CELL_ID = 5;


function createArray(rows, cols, defaultValue) {
  return Array.from({ length: rows }, () => Array(cols).fill(defaultValue));
}

// Функция для генерации случайного числа в заданном диапазоне
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Функция для размещения прямоугольных комнат и проходов в массиве
function placeRoomsAndCorridors(array) {
  // Размещаем случайное количество вертикальных и горизонтальных проходов
  const numCorridors = getRandomInt(3, 5);
  for (let i = 0; i < numCorridors; i++) {
    // Вертикальный проход
    
    const corridorX = getRandomInt(1, array.length - 2);
    for (let y = 0; y < array[0].length; y++) {
      array[corridorX][y] = EMPTY_CELL_ID;
    }
    
    // Горизонтальный проход
  
    const corridorY = getRandomInt(1, array[0].length - 2);
    for (let x = 0; x < array.length; x++) {
      array[x][corridorY] = EMPTY_CELL_ID;
    }
    
  }
  // Размещаем случайное количество прямоугольных комнат
  const numRooms = getRandomInt(5, 10);

  const isRoomReachable = (startX, startY, roomHeight, roomWidth) => {
    const onRight = startX + roomWidth === array[0].length - 1;
    const onLeft = startX === 0;

    const onBottom = startY + roomHeight === array.length - 1;
    const onTop = startY === 0;

    for (let y = startY; y < startY + roomHeight; y++) {
      if (!onRight) {
        if (array[y][startX + roomWidth] === EMPTY_CELL_ID) {
          return true;
        }
      } 
      if (!onLeft) {
        if (array[y][startX - 1] === EMPTY_CELL_ID) {
          return true;
        }
      }
    }

    for (let x = startX; x < startX + roomWidth; x++) {
      if (!onTop) {
        if (array[startY - 1][x] === EMPTY_CELL_ID) {
          return true;
        }
      } 
      if (!onBottom) {
        if (array[startY + roomHeight][x] === EMPTY_CELL_ID) {
          return true
        }
      } 
    }

    return false
  }

  for (let i = 0; i < numRooms; i++) {
    const roomHeight = getRandomInt(3, 8);
    const roomWidth = getRandomInt(3, 8);

    let startY = 0;
    let startX = 0;

    do {
      startY = getRandomInt(0, array.length - roomHeight - 1); // 0 to 23
      startX = getRandomInt(0, array[0].length - roomWidth - 1); // 0 to 39
    } while (!isRoomReachable(startX,startY, roomHeight, roomWidth));

    for (let x = startY; x < startY + roomHeight; x++) {
      for (let y = startX; y < startX + roomWidth; y++) {
        array[x][y] = EMPTY_CELL_ID;
      }
    }
  }
}

function getAvailableCells(field) {
  const indices = [];

  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field[0].length; j++) {
      if (field[i][j] === EMPTY_CELL_ID) {
        indices.push([i, j]);
      }
    }
  }

  return indices;
}

function popRandomElement(array) {
  const elementIndex = getRandomInt(0, array.length - 1);
  const element = array[elementIndex];
  array[elementIndex] = array[array.length - 1];
  array.pop();
  return element
}

class Person {
  hp = 100
  damage = 20
  field = []
  position = {
    x: 0, y: 0
  }
  htmlElement = null
  healthLine = null

  constructor(positionX, positionY, className, field) {
    this.position.x = positionX
    this.position.y = positionY
    this.field = field

    const element = document.createElement('div');
    element.className = className;

    const healthLine = document.createElement('div');
    healthLine.className = 'health'
    healthLine.style.width = this.hp + '%'
    
    element.appendChild(healthLine)
    
    document.getElementById('js__field').appendChild(element);
    element.style.left = positionX * CELL_SIZE + 'px'
    element.style.top = positionY * CELL_SIZE + 'px'

    this.htmlElement = element
    this.healthLine = healthLine
  }

  makeMoveIfValid = (newX, newY) => { 
    if (newX >= 0 && newX < this.field[0].length && newY >= 0 && newY < this.field.length && this.field[newY][newX]) {
        this.position.x = newX;
        this.position.y = newY;
        return true;
    }
    return false;
  };

  areNeighbours(otherPerson) {
    return Math.abs(this.position.x - otherPerson.position.x) <= 1 && Math.abs(this.position.y - otherPerson.position.y) <= 1
  }

  deathAnimation(onFinish = () => {}) {
    this.htmlElement.removeChild(this.healthLine)
    const keyframes = [
      { transform: 'rotate(0deg) translateY(0)', opacity: 1 },
      { transform: 'rotate(-90deg) translateY(0)', opacity: 1 },
      { transform: 'rotate(-90deg) translateX(100px)', opacity: 0 }
    ];

    const options = {
        duration: 1200,
        easing: 'ease-out',
        iterations: 1
    };

    const animation = this.htmlElement.animate(keyframes, options);
    animation.addEventListener('finish', () => {
          this.htmlElement.remove();
          onFinish()
        })
  }
}

class Protagonist extends Person {
  enemies = []
  updateHtmlElementPlace() {
    this.htmlElement.style.left = this.position.x * CELL_SIZE + 'px'
    this.htmlElement.style.top = this.position.y * CELL_SIZE + 'px'
  }

  isEnemiesOnCell(x, y) {
    return this.enemies.findIndex(enemy => enemy.position.x === x && enemy.position.y === y) !== -1;
  }
  move(where) {
    switch (where) {
      case 'left': {
          if (this.isEnemiesOnCell(this.position.x - 1, this.position.y)) {
            return
          }
          this.makeMoveIfValid(this.position.x - 1, this.position.y)
          break;
      }
      case 'right': {
          if (this.isEnemiesOnCell(this.position.x + 1, this.position.y)) {
            return
          }
          this.makeMoveIfValid(this.position.x + 1, this.position.y)
          break;
      }
      case 'up':{
          if (this.isEnemiesOnCell(this.position.x, this.position.y - 1)) {
            return
          }
          this.makeMoveIfValid(this.position.x, this.position.y - 1)
          break;
      }
      case 'down': {
          if (this.isEnemiesOnCell(this.position.x, this.position.y + 1)) {
            return
          }
          this.makeMoveIfValid(this.position.x, this.position.y + 1)
          break;
      }
    }
    this.updateHtmlElementPlace();
    this.checkForBoons();
  }

  findEnemies() {
    return this.enemies.filter(enemy => {
      return enemy.areNeighbours(this);
    })
  }
  attack() {
    this.findEnemies().forEach(enemy => {
      enemy.takeDamage(this.damage)
    })
  }

  takeDamage(damage) {
    this.hp -= damage
    this.healthLine.style.width = this.hp + '%'
    const keyframes = [
      { borderColor: '#d0d0d0' },
      { borderColor: '#dc0404' },
      { borderColor: '#d0d0d0' }
    ];
    
    // Определяем параметры анимации
    const options = {
        duration: 500,        // Продолжительность анимации в миллисекундах
        easing: 'ease-out', // Функция ускорения
        iterations: 1          // Количество повторений (в данном случае, один раз)
    };
      
    const borderElement = document.getElementsByClassName('js__field-box')[0]
    // Создаем объект анимации
    borderElement.animate(keyframes, options);
    
    if (this.hp <= 0) {
      this.death()
    }
  }

  checkForBoons() {
    const cellId = this.field[this.position.y][this.position.x]
    switch (cellId) {
      case HEALTH_CELL_ID: {
        if (this.hp < 100) {
          this.hp += 20;
          this.healthLine.style.width = this.hp + '%'
          this.animateBoonPick('#12c605')
          this.field[this.position.y][this.position.x] = EMPTY_CELL_ID
        }
        break;
      }
      case SWORD_CELL_ID: {
        this.damage += 20;
        this.animateBoonPick('blue')
        this.field[this.position.y][this.position.x] = EMPTY_CELL_ID
      }
    }
  }

  animateBoonPick(color) {
    const cell = document.getElementById(this.position.x + ' ' + this.position.y);
    cell.className = 'tile';

    const keyframes = [
      { borderColor: '#d0d0d0' },
      { borderColor: color },
      { borderColor: '#d0d0d0' }
    ];
    
    // Определяем параметры анимации
    const options = {
        duration: 1200,        // Продолжительность анимации в миллисекундах
        easing: 'ease-out', // Функция ускорения
        iterations: 1          // Количество повторений (в данном случае, один раз)
    };

    const borderElement = document.getElementsByClassName('js__field-box')[0]
    // Создаем объект анимации
    borderElement.animate(keyframes, options);
  }

  death() {
    this.deathAnimation(() => {document.getElementById('js__gameOver').style.display = 'block';});
  }
}

class Enemy extends Person {
  animationId = null
  protagonist = null
  attackSpeed = 400
  speed = 800

  died = false
  constructor(positionX, positionY, className, field, protagonist) {
    super(positionX, positionY, className, field);
    this.protagonist = protagonist
  }

  makeRandomMove() {
    const directions = ['left', 'right', 'up', 'down'];
    const directionToCheck = {
      left: true,
      right: true,
      up: true,
      down: true,
      checkCount: 0
    }
    while (directionToCheck.checkCount < 4) {

      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      switch (randomDirection) {
          case 'left': {
              if (this.makeMoveIfValid(this.position.x - 1, this.position.y))
                return randomDirection;
              if (directionToCheck[randomDirection]) {
                directionToCheck[randomDirection] = false;
                directionToCheck.checkCount += 1;
              }
              break;
          }
          case 'right': {
              if (this.makeMoveIfValid(this.position.x + 1, this.position.y))
                return randomDirection;
              if (directionToCheck[randomDirection]) {
                directionToCheck[randomDirection] = false;
                directionToCheck.checkCount += 1;
              }
              break;
          }
          case 'up':{
              if (this.makeMoveIfValid(this.position.x, this.position.y - 1))
                return randomDirection;
              if (directionToCheck[randomDirection]) {
                directionToCheck[randomDirection] = false;
                directionToCheck.checkCount += 1;
              }
              break;
          }
          case 'down': {
              if (this.makeMoveIfValid(this.position.x, this.position.y + 1))
                return randomDirection;
              if (directionToCheck[randomDirection]) {
                directionToCheck[randomDirection] = false;
                directionToCheck.checkCount += 1;
              }
              break;
          }
      }
    }
    return null
  }
  
  animateElement() {
    if (!this.htmlElement.animationData) {
      const direction = this.makeRandomMove();
      const startCoord = direction === 'left' || direction === 'right' ? 'left' : 'top';
  
      this.htmlElement.animationData = {
        start: parseFloat(this.htmlElement.style[startCoord]) || 0,
        end: (direction === 'left' || direction === 'up' ? -1 : 1) * CELL_SIZE + parseFloat(this.htmlElement.style[startCoord]) || 0,
        startTime: performance.now(),
        duration: this.speed,
        direction,
      };
    }
  
    const { start, end, startTime, duration, direction } = this.htmlElement.animationData;
    if (!direction) {
      return // заканчиваем анимацию
    }
    const progress = Math.min(1, (performance.now() - startTime) / duration);
  
    const coord = direction === 'left' || direction === 'right' ? 'left' : 'top';
    const value = start + (end - start) * progress;
  
    this.htmlElement.style[coord] = value + 'px';
  
    if (progress === 1) {
      this.htmlElement.animationData = null;
      if (this.areNeighbours(this.protagonist)) {
        this.htmlElement.stopAnimation = true;
        this.attackProtagonist();
      }

    }
    if (!this.htmlElement.stopAnimation) 
        this.animationId = requestAnimationFrame(() => this.animateElement());
  }

  death() {
    cancelAnimationFrame(this.animationId);
    this.deathAnimation();
    
    this.died = true;
    this.position.x = -100;
    this.position.y = -100;

  }

  attackProtagonist() {
    setTimeout(() => {
      if (this.died) {
        return
      }
      if (this.areNeighbours(this.protagonist)) {
        this.protagonist.takeDamage(this.damage)
        if (this.protagonist.hp > 0) {
          this.attackProtagonist()
        }
      } else {
        this.htmlElement.stopAnimation = false
        this.animateElement();
      }
    }, this.attackSpeed)
  }

  takeDamage(damage) {
    this.hp -= damage
    this.healthLine.style.width = (this.hp ? this.hp : 0) + '%'

    if (this.hp <= 0) {
      this.death()
    }
  }

}

class Game {
    field = []
    enemies = []
    enemiesCount = 10
    protagonist = null
    healthBoons = 10
    damageBoons = 2

    constructor() {
      let columns = 40
      let rows = 24

      // Создаем двумерный массив 40x24 и заполняем его нулями
      this.field = createArray(rows, columns, WALL_CELL_ID);

      placeRoomsAndCorridors(this.field);
      
      this.field.map((row, i) => {
        row.map((el,j) => {
          const newCell = document.createElement('div');
          newCell.classList.add(el ? 'tile' : 'tileW')
          if (el)
            newCell.id = j + ' ' + i;
          newCell.style.left = CELL_SIZE*j + 'px';
          newCell.style.top = CELL_SIZE*i + 'px';
          const fieldContainer = document.getElementById('js__field');
          // console.log(fieldContainer)
          fieldContainer.appendChild(newCell);
        })
      })
      

      const availableCells = getAvailableCells(this.field);


      const [y, x] = popRandomElement(availableCells)
      this.protagonist = new Protagonist(x, y, 'tileP', this.field)

      for (let i = 0; i < this.enemiesCount; i++) {
        const [y, x] = popRandomElement(availableCells);
        const newEnemy = new Enemy(x, y, 'tileE', this.field, this.protagonist);
        newEnemy.animateElement();
        this.enemies.push(newEnemy)
      }

      this.protagonist.enemies = this.enemies

      // размещаем hp
      for (let i = 0; i < this.healthBoons; i++) {
        const [y, x] = popRandomElement(availableCells);
        const cell = document.getElementById(x + ' ' + y);
        cell.className = 'tileHP'
        this.field[y][x] = HEALTH_CELL_ID;
      }

      // размещаем оружие
      for (let i = 0; i < this.damageBoons; i++) {
        const [y, x] = popRandomElement(availableCells);
        const cell = document.getElementById(x + ' ' + y);
        cell.className = 'tileSW'
        this.field[y][x] = SWORD_CELL_ID;
      }

    }
}

  
  document.addEventListener('DOMContentLoaded', () => {
    var game = new Game();

    document.addEventListener('keydown', function(event) {

      
      // Обработка события нажатия клавиши
      switch(event.key) {
          case 'a':
              game.protagonist.move('left');
              break;
          case 'd':
              game.protagonist.move('right');
              break;
          case 'w':
              game.protagonist.move('up');
              break;
          case 's':
              game.protagonist.move('down');
              break;
          case ' ' :
            //attack
            game.protagonist.attack()
            if (game.enemies.findIndex(enemy => !enemy.died) === -1) {
              setTimeout(() => {
                document.getElementById('js__gameOver').classList.add('gameWin')
                document.getElementById('js__gameOver').style.display = 'block';
              }, 1500)
            }
          // Другие клавиши могут быть обработаны по необходимости
      }
  });
  document.getElementById('reload').addEventListener('click', () => window.location.reload())

  });
  