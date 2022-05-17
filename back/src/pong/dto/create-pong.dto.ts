import { Ball, Player }  from '../interfaces/pong.interface';

export class CreatePongDto {
	paddle_height: number;
	paddle_width: number;
	player1: Player;
	player2: Player;
	ball: Ball;
}
