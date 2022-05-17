import PointI from './point.interface'
import PlayerI from './player.interface'
import BallI from './ball.interface'

export default interface PongI {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	player_dimensions: PointI;
	player: PlayerI;
	opponent: PlayerI;
	ball: BallI;
  fps: number;
}
