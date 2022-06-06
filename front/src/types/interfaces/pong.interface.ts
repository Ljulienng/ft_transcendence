import PointI from './point.interface'
import PlayerI from './player.interface'
import BallI from './ball.interface'

export default interface PongI {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  playerSize: PointI;
  playerRight: PlayerI;
  playerLeft: PlayerI;
  ball: BallI;
  isLeftSide: boolean;
}
