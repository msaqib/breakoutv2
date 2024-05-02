const boardWidth = 670
const boardHeight = 300

const blockWidth = 100
const blockHeight = 20
const blockScore = 10
const blockSpace = 10

const rows = 3
const columns = 6

const ballX = 320
const ballY = 102
const ballWidth = 10
const ballHeight = 10
const ballSpeed = 10

const maxScore = columns * rows * blockScore

const batX = 280
const batY = 10
const batSpeed = 100

const expectedInterval = 16

let gameOver = false

let ballvx = 10
let ballvy = 10

let batvx = 0

let lastTime = 0

const grid = document.querySelector('.grid')

const bat = new Block(batX, batY, blockWidth, blockHeight)
displayBlock(bat, 'bat')

const ball = new Block(ballX, ballY, ballWidth, ballHeight)
displayBlock(ball, 'ball')

const scoreSpan = document.getElementById('score')
const gameover = document.getElementById('gameover')

let score = 0

const splashScreen = document.getElementById('splashScreen');
const countdownElement = document.getElementById('countdown');

// Show the splash screen initially
splashScreen.style.display = 'flex';

// Countdown and start the game
let countdown = 3;
countdownElement.textContent = countdown;

function getStar() {
    const minRadius = 0.5
    const maxRadius = 2
    const radius = Math.random() * (maxRadius - minRadius)
    const x = Math.floor(Math.random() * boardWidth)
    const y = Math.floor(Math.random() * boardHeight)
    const star = document.createElement('div')
    star.style.width = `${radius}px`
    star.style.height = `${radius}px`
    star.style.position = 'absolute'
    console.log('x: ', x, ', y: ', y)
    star.style.left = `${x}px`
    star.style.top = `${y}px`
    star.style.zIndex = -1
    star.style.backgroundColor = '#FFF'
    return star
}

function background() {
    for (let i = 1; i < 100 ; i++) {
        grid.appendChild(getStar())
    }
}

function gameLoop(time) {
    if(time) {
        const deltams = time - lastTime
        moveBall(deltams)
        moveBat(deltams)
        lastTime = time
        if (!gameOver)
            requestAnimationFrame(gameLoop)
    }
}

function moveBat(deltams) {
    if ((batvx === -1 * batSpeed && bat.bottomLeft.x >= blockSpace) ||
        (batvx === batSpeed && bat.bottomLeft.x <= boardWidth - blockWidth - blockSpace)) {
            const distance = batvx / deltams
            bat.setX(bat.bottomLeft.x + distance)
            const bElement = document.querySelector('.bat');
            bElement.style.left = bat.bottomLeft.x + 'px'
    }
}

function handleKeys(event) {
    const key = event.key
    switch(key) {
    case 'ArrowLeft':
        batvx = -1 * batSpeed
        break
    case 'ArrowRight':
        batvx = batSpeed
        break;
    }
}

function stopBat(event) {
    switch(event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            batvx = 0
            break;
    } 
}

function Block(left, bottom, width, height) {
    this.bottomLeft = {x:left, y: bottom}
    this.bottomRight = {x:left + width, y: bottom}
    this.topLeft = {x: left, y: bottom + height}
    this.topRight = {x: left + width, y: bottom + height}
    this.width = width
    this.height = height
}

Block.prototype.setX = function(x) {
        this.bottomLeft.x = x;
        this.bottomRight.x = x + this.width
        this.topRight.x = x + this.width
        this.topLeft.x = x
}

Block.prototype.setY = function(y) {
        this.bottomLeft.y = y;
        this.topLeft.y = y + this.height;
        this.bottomRight.y = y;
        this.topRight.y = y + this.height;
}

const blocks = []

createRows()
displayBlocks()

function displayBlocks() {
    blocks.forEach( b => displayBlock(b, 'block'))
}

function displayBlock(b, style) {
    const block = document.createElement('div')
        block.classList.add(style)
        block.style.left = b.bottomLeft.x + 'px'
        block.style.bottom = b.bottomLeft.y + 'px'
        grid.appendChild(block)
}

function creatRow(row) {
    for (let i = 0 ; i < columns ; i++) {
        const block = new Block( blockSpace + i * (blockWidth + blockSpace), boardHeight - row * (blockHeight + blockSpace), blockWidth, blockHeight)
        blocks.push(block)
    }
}

function createRows() {
    for (let j = 1 ; j <= rows ; j++) {
        creatRow(j)
    }
}

function moveBall(deltams) {
    checkCollision()
    scoreSpan.innerHTML = score
    if (score === maxScore) {
        gameOver = true
        gameover.innerHTML = " (YOU WON!)"
        stop()
    }
    
    const dx = ballvx / deltams
    const dy = ballvy / deltams
    ball.setX(ball.bottomLeft.x + dx)
    ball.setY(ball.bottomLeft.y + dy)
    const ballElement = document.querySelector('.ball')
    ballElement.style.left = ball.bottomLeft.x + 'px'
    ballElement.style.bottom = ball.bottomLeft.y + 'px'
}

function reboundFromBat() {
    if (checkBounds(bat)) {
        ballvy = -1 * ballvy
        // if we hit the bat on the right half it should bounce off to the right
        // otherwise to the left
        if (ball.bottomLeft.x - bat.topLeft.x < (blockWidth / 2)) {
            ballvx = -1 * ballSpeed
        }
        else {
            ballvx = ballSpeed
        }
    }
}

function reboundFromFrame() {
    // Check bounds of the play board
    // Did we hit the right or left wall
    if (ball.topRight.x >= boardWidth || ball.topLeft.x <= 0) {
        ballvx = -1 * ballvx
    }
    // Did we hit the top wall
    if (ball.topRight.y >= boardHeight) {
        ballvy = -1 * ballvy
    }
    // Did we hit the bottom wall
    else if (ball.bottomRight.y <= 0) {
        stop()
        gameover.innerHTML = " (GAME OVER)"
    }
}

function removeBlock(blkIndex) {
    const allBlocks = document.querySelectorAll('.block')
    grid.removeChild(allBlocks[blkIndex])
    blocks.splice(blkIndex, 1)
}

function reboundFromBlock(){
    const blkIndex = blocks.findIndex(checkBounds)
    if (blkIndex >= 0) {
        // If we hit a side wall, we need to reverse the x direction,
        // otherwise we need to reverse the y direction        
        if (hitSide(blocks[blkIndex])) {
            ballvx = -1 * ballvx
        }                
        else {
            ballvy = -1 * ballvy
        } 
        removeBlock(blkIndex)
        score = score + blockScore
    }   
}

function checkCollision() {
    // Did we hit the bat
    reboundFromBat()
    reboundFromFrame()
    reboundFromBlock()    
}

function checkBounds(b) {
    const dx = ballvx / expectedInterval
    const dy = ballvy / expectedInterval 
    return ball.topRight.x + dx> b.topLeft.x && 
            ball.topLeft.x + dx < b.topRight.x &&
            ball.topLeft.y + dy > b.bottomLeft.y &&
            ball.bottomLeft.y + dy < b.topLeft.y
}

function hitSide(b) {
    const yDirection = ballvy / expectedInterval
    const x1 = ball.bottomLeft.y - yDirection > b.topLeft.y
    const x2 = ball.topLeft.y - yDirection < b.bottomLeft.y
    if ( x1 || x2) {
        return false
    }
    return true
}

function stop() {
    gameOver = true
    document.removeEventListener('keydown', handleKeys)
    document.removeEventListener('keyup', stopBat)
}

const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown === 0) {
        countdownElement.textContent = 'GO!'
    } else if (countdown < 0) {
        clearInterval(countdownInterval)
        splashScreen.style.display = 'none' // Hide the splash screen
        document.addEventListener('keydown', handleKeys)
        document.addEventListener('keyup', stopBat)
        background()
        requestAnimationFrame(gameLoop)
    } else {
        countdownElement.textContent = countdown;
    }
}, 1000);