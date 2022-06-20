import { User } from 'src/user/models/user.entity';
import { Socket } from 'socket.io'

export interface Spectator {
    socket: Socket;
    user: User;
  }
  