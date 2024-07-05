import { Socket } from 'socket.io';

export type clientInfo = {
  client: Socket,
  id: number,
}
