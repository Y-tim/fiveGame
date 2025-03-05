import { BOARD_SIZE, CELL_SIZE, PIECE_RADIUS, PLAYER } from '../utils/constants'
import { Board } from '../logic/board'
import { AI } from '../logic/ai'
import { MenuScene } from './menuScene'
import { gameManager } from '../utils/gameManager'  // 添加这行

export class GameScene {
    constructor(canvas, context, difficulty) {
        this.canvas = canvas
        this.ctx = context
        this.difficulty = difficulty

        // 添加边距确保棋盘不会贴近屏幕边缘
        const margin = 20
        // 计算棋盘在屏幕上的位置，使其居中
        this.boardOffset = {
            x: (this.canvas.width - BOARD_SIZE * CELL_SIZE) / 2,
            y: (this.canvas.height - BOARD_SIZE * CELL_SIZE) / 2
        }
        
        this.board = new Board()
        this.ai = new AI(difficulty)
        this.currentPlayer = PLAYER.BLACK // 玩家默认使用黑子
        this.gameOver = false
        
        this.bindTouchEvent()
        this.addReturnButton()
    }

    bindTouchEvent() {
        wx.offTouchStart()
        
        wx.onTouchStart(e => {
            const touch = e.touches[0]
            
            // 检查是否点击返回按钮
            if (touch.clientX >= this.returnBtn.x && 
                touch.clientX <= this.returnBtn.x + this.returnBtn.width &&
                touch.clientY >= this.returnBtn.y && 
                touch.clientY <= this.returnBtn.y + this.returnBtn.height) {
                wx.offTouchStart()
                gameManager.getGame().switchScene(new MenuScene(this.canvas, this.ctx))  // 修改这行
                return
            }

            // 落子逻辑
            if (this.gameOver || this.currentPlayer !== PLAYER.BLACK) return
            // 优化坐标计算
            const boardX = touch.clientX - this.boardOffset.x
            const boardY = touch.clientY - this.boardOffset.y
            
            // 使用 Math.floor 代替 Math.round，并添加偏移修正
            const x = Math.floor((boardX + CELL_SIZE / 2) / CELL_SIZE)
            const y = Math.floor((boardY + CELL_SIZE / 2) / CELL_SIZE)

            if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
                if (this.board.placePiece(x, y, PLAYER.BLACK)) {
                    // 立即重绘棋盘
                    this.render()
                    
                    if (this.board.checkWin(x, y, PLAYER.BLACK)) {
                        this.gameOver = true
                        this.showGameResult('恭喜你获胜！')
                        return
                    }

                    this.currentPlayer = PLAYER.WHITE
                    // 减少AI延迟时间
                    setTimeout(() => this.aiMove(), 200)
                }
            }
        })
    }

    aiMove() {
        // 添加计时器以监控AI性能
        const startTime = Date.now()
        
        const move = this.ai.getMove(this.board)
        if (move) {
            const [x, y] = move
            this.board.placePiece(x, y, PLAYER.WHITE)
            
            // 立即重绘棋盘
            this.render()
            
            if (this.board.checkWin(x, y, PLAYER.WHITE)) {
                this.gameOver = true
                this.showGameResult('AI获胜！')
                return
            }
        }
        
        // 如果AI思考时间过长，输出警告
        const endTime = Date.now()
        if (endTime - startTime > 1000) {
            console.warn('AI思考时间过长：', endTime - startTime, 'ms')
        }
        
        this.currentPlayer = PLAYER.BLACK
    }
    addReturnButton() {
        const btnWidth = 100
        const btnHeight = 40

        this.returnBtn = {
            x: (this.canvas.width - btnWidth) / 2,  // 水平居中
            y: this.boardOffset.y + BOARD_SIZE * CELL_SIZE + 30,  // 棋盘下方30像素
            width: btnWidth,
            height: btnHeight
        }
    }
    showGameResult(message) {
        wx.showModal({
            title: '游戏结束',
            content: message,
            showCancel: false,
            success: () => {
                gameManager.getGame().switchScene(new MenuScene(this.canvas, this.ctx))  // 修改这行
            }
        })
    }
    update() {
        // 游戏场景的更新逻辑
    }
    render() {
        // 清空画布
        this.ctx.fillStyle = '#f0f0f0'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // 绘制棋盘
        this.drawBoard()
        
        // 绘制棋子
        this.drawPieces()
        
        // 绘制返回按钮
        this.drawReturnButton()
    }
    drawBoard() {
        const startX = this.boardOffset.x
        const startY = this.boardOffset.y
        const endX = startX + BOARD_SIZE * CELL_SIZE
        const endY = startY + BOARD_SIZE * CELL_SIZE

        // 绘制背景
        this.ctx.fillStyle = '#e3c887'
        this.ctx.fillRect(startX, startY, BOARD_SIZE * CELL_SIZE, BOARD_SIZE * CELL_SIZE)

        // 绘制网格线
        this.ctx.strokeStyle = '#000000'
        this.ctx.lineWidth = 1

        for (let i = 0; i <= BOARD_SIZE; i++) {
            // 横线
            this.ctx.beginPath()
            this.ctx.moveTo(startX, startY + i * CELL_SIZE)
            this.ctx.lineTo(endX, startY + i * CELL_SIZE)
            this.ctx.stroke()

            // 竖线
            this.ctx.beginPath()
            this.ctx.moveTo(startX + i * CELL_SIZE, startY)
            this.ctx.lineTo(startX + i * CELL_SIZE, endY)
            this.ctx.stroke()
        }
    }
    drawPieces() {
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                const piece = this.board.getPiece(x, y)
                if (piece) {
                    // 修正棋子绘制位置，使其对准格子交叉点
                    const centerX = this.boardOffset.x + x * CELL_SIZE
                    const centerY = this.boardOffset.y + y * CELL_SIZE

                    this.ctx.beginPath()
                    this.ctx.arc(centerX, centerY, PIECE_RADIUS, 0, Math.PI * 2)
                    this.ctx.fillStyle = piece === PLAYER.BLACK ? '#000000' : '#ffffff'
                    this.ctx.fill()
                    
                    if (piece === PLAYER.WHITE) {
                        this.ctx.strokeStyle = '#000000'
                        this.ctx.stroke()
                    }
                }
            }
        }
    }
    drawReturnButton() {
        this.ctx.fillStyle = '#ffffff'
        this.ctx.fillRect(this.returnBtn.x, this.returnBtn.y, 
                         this.returnBtn.width, this.returnBtn.height)
        
        this.ctx.strokeStyle = '#333333'
        this.ctx.strokeRect(this.returnBtn.x, this.returnBtn.y, 
                           this.returnBtn.width, this.returnBtn.height)
        
        this.ctx.fillStyle = '#333333'
        this.ctx.font = '16px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.fillText('返回菜单', 
                         this.returnBtn.x + this.returnBtn.width / 2, 
                         this.returnBtn.y + this.returnBtn.height / 2 + 6)
    }
}