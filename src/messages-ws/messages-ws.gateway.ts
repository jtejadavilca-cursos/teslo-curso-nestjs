import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {

    const token = client.handshake.headers.authentication as string;

    try {
      const payload = this.jwtService.verify(token);
      
      await this.messagesWsService.registerClient(client, payload.id);

      this.updateClientList();
    } catch (error) {
      client.emit('wrong-token', { message: 'Invalid token' });
      // client.disconnect();
      return;
    }

  }


  handleDisconnect(client: Socket) {

    console.log('Client disconnected: ', client.id);
    this.messagesWsService.removeClient(client.id);

    this.updateClientList();  
  }

  @SubscribeMessage('message-from-client')
  handleMessage(client: Socket, payload: NewMessageDto) {
    console.log('Message received: ', payload.message);

    //! Emite únicamente al cliente que envió el mensaje
    // client.emit('message-from-server', {
    //   fullName: 'test',
    //   message: payload.message,
    // });
    //! Emite a todos los clientes conectados menos al que envió el mensaje
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'test',
    //   message: payload.message,
    // });
    //! Emite a todos los clientes conectados
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message,
    });
  }

  private updateClientList() {
    this.wss.emit('clients-updated', this.messagesWsService.getNumConnectedClients())
  }
}

