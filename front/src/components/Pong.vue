<template>
<div class="board">
	<h1>Pong</h1>
	<canvas id="canvas" tabindex="0" width="640" height="480" @click.once="play" @mousemove="move" @keydown="move">
		{{ unsupportedMsg }}
	</canvas>
</div>
</template>

<script>
export default {
	name: 'Pong',
	data() {
		return {
			unsupportedMsg: 'Sorry, your browser does not support canvas.'
		};
	},
	methods: {
		start() {
			this.context.fillStyle = 'black';
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.fillStyle = 'white';
			this.context.font = "64px Orbitron";
			this.context.textAlign = "center";
			this.context.fillText("CLICK TO START", this.canvas.width / 2, this.canvas.height / 2);
		},
		draw() {
			// Draw fields
			this.context.fillStyle = 'black';
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			// Draw middle lines
			this.context.strokeStyle = 'white';
			this.context.beginPath();
			this.context.moveTo(this.canvas.width / 2, 0);
			this.context.lineTo(this.canvas.width / 2, this.canvas.height);
			this.context.stroke();
			// Draw players
			this.context.fillStyle = 'white';
			this.context.fillRect(0, this.player1.pos, this.player_width, this.player_height);
			this.context.fillRect(this.canvas.width - this.player_width, this.player2.pos, this.player_width, this.player_height);
			// Draw ball
			this.context.beginPath();
			this.context.fillStyle = 'white';
			this.context.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2, false);
			this.context.fill();
			// Draw scores
			this.context.fillStyle = 'white';
			this.context.font = "64px Orbitron";
			this.context.textAlign = "center";
			this.context.fillText(this.player1.score.toString(), 100, 100);
			this.context.fillText(this.player2.score.toString(), this.canvas.width - 100, 100);
		},
		play() {
			this.draw();
			this.ballMove();
			requestAnimationFrame(this.play);
		},
		move(e) {
			if (e.type == "mousemove") {
				let rect = this.canvas.getBoundingClientRect();
				let mouseLocation = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height;
				if (mouseLocation > this.canvas.height - this.player_height / 2) {
					this.player1.pos = this.canvas.height - this.player_height;
				} else {
					this.player1.pos = mouseLocation - this.player_height / 2;
				}
			}
			if (e.type == "keydown") {
				// Player 1
				if (e.key == "w") {
					if (this.player1.pos > 0) {
						this.player1.pos -= 10;
					}
				} else if (e.key == "s") {
					if (this.player1.pos < this.canvas.height - this.player_height) {
						this.player1.pos += 10;
					}
				}
				// Player 2
				if (e.key == "ArrowUp") {
					if (this.player2.pos > 0) {
						this.player2.pos -= 10;
					}
				} else if (e.key == "ArrowDown") {
					if (this.player2.pos < this.canvas.height - this.player_height) {
						this.player2.pos += 10;
					}
				}
			}
		},
		ballMove() {
			// Rebounds on top and bottom
			if (this.ball.y > this.canvas.height || this.ball.y < 0) {
				this.ball.speed.y *= -1;
			}
			// Update ball pos
			this.ball.x += this.ball.speed.x;
			this.ball.y += this.ball.speed.y;
			// Check collisions with players
			if (this.ball.x > this.canvas.width - this.player_width) {
				this.collide(this.player2.pos);
			} else if (this.ball.x < this.player_width) {
				this.collide(this.player1.pos);
			}
		},
		collide(pos) {
			// The player does not hit the ball
			if (this.ball.y < pos || this.ball.y > pos + this.player_height) {
				// Increment scores
				if (this.ball.x < this.canvas.width / 2) {
					this.player2.score += 1;
				} else if (this.ball.x >= this.canvas.width / 2) {
					this.player1.score += 1;
				}
				// Reset ball pos
				this.ball.x = this.canvas.width / 2;
				this.ball.y = this.canvas.height / 2;
				// Reset players pos
				this.player1.pos = this.canvas.height / 2 - this.player_height / 2;
				this.player2.pos = this.canvas.height / 2 - this.player_height / 2;
				// Reset speed
				this.ball.speed.x = 2;
			} else {
				// Increase speed and change direction
				this.ball.speed.x *= -1.2;
				if (this.ball.speed.x > this.max_speed) {
					this.ball.speed.x = this.max_speed;
				} else if (this.ball.speed.x < -this.max_speed) {
					this.ball.speed.x = -this.max_speed;
				}
				// 
				let impact = this.ball.y - pos - this.player_height / 2;
				let ratio = 100 / (this.player_height / 2);
				this.ball.speed.y = Math.round(impact * ratio / 20);
				if (this.ball.speed.y > this.max_speed) {
					this.ball.speed.y = this.max_speed;
				} else if (this.ball.speed.y < -this.max_speed) {
					this.ball.speed.y = -this.max_speed;
				}
			}
		},
	},
	mounted() {
		this.player_height = 100;
		this.player_width = 5;
		this.max_speed = 25;
		this.canvas = document.getElementById("canvas");
		this.context = this.canvas.getContext("2d");
		this.player1 = {
			pos: this.canvas.height / 2 - this.player_height / 2,
			score: 0
		};
		this.player2 = {
			pos: this.canvas.height / 2 - this.player_height / 2,
			score: 0
		};
		this.ball = {
			x: this.canvas.width / 2,
			y: this.canvas.height / 2,
			r: 5,
			speed: {
				x: 2,
				y: 2
			}
		};
		this.start();
	}
}
</script>

<style lang="scss" scoped>
@import "https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap";

#canvas {
	margin-left: 250px;
	font-family: 'Orbitron', sans-serif;
	font-weight: 900;
}
</style>
