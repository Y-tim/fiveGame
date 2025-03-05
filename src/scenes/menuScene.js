import { GameScene } from './gameScene'
import { DIFFICULTY } from '../utils/constants'
import { gameManager } from '../utils/gameManager'  // 添加这行

export class MenuScene {
    constructor(canvas, context) {
        this.canvas = canvas
        this.ctx = context
        this.buttons = [
            { text: '简单模式', difficulty: DIFFICULTY.EASY },
            { text: '中等模式', difficulty: DIFFICULTY.MEDIUM },
            { text: '困难模式', difficulty: DIFFICULTY.HARD }
        ]
        this.initButtons()
        this.bindTouchEvent()
    }

    initButtons() {
        const buttonHeight = 50
        const buttonWidth = 200
        const startY = this.canvas.height / 3

        this.buttons = this.buttons.map((btn, index) => ({
            ...btn,
            x: (this.canvas.width - buttonWidth) / 2,
            y: startY + index * (buttonHeight + 20),
            width: buttonWidth,
            height: buttonHeight
        }))
    }

    bindTouchEvent() {
        wx.onTouchStart(e => {
            const touch = e.touches[0]
            const btn = this.buttons.find(btn => 
                touch.clientX >= btn.x && 
                touch.clientX <= btn.x + btn.width &&
                touch.clientY >= btn.y && 
                touch.clientY <= btn.y + btn.height
            )

            if (btn) {
                // 使用 gameManager 替代直接使用 game
                gameManager.getGame().switchScene(new GameScene(this.canvas, this.ctx, btn.difficulty))
            }
        })
    }

    update() {
        // 菜单场景不需要更新逻辑
    }

    render() {
        this.ctx.fillStyle = '#f0f0f0'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // 绘制标题
        this.ctx.fillStyle = '#333333'
        this.ctx.font = '30px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.fillText('五子棋', this.canvas.width / 2, this.canvas.height / 4)

        // 绘制按钮
        this.buttons.forEach(btn => {
            this.ctx.fillStyle = '#ffffff'
            this.ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
            
            this.ctx.strokeStyle = '#333333'
            this.ctx.strokeRect(btn.x, btn.y, btn.width, btn.height)
            
            this.ctx.fillStyle = '#333333'
            this.ctx.font = '20px Arial'
            this.ctx.textAlign = 'center'
            this.ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 8)
        })
    }
}