import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';


interface ConnectedClient {
    [id: string]: {
        socket: Socket,
        user: User
    },
}

@Injectable()
export class MessagesWsService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    private connectedClients: ConnectedClient[] = [];

    async registerClient(client: Socket, userId: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if(!user) {
            throw new Error('User not found');
        }
        if(!user.isActive) {
            throw new Error('User is not active');
        }

        this.connectedClients[client.id] = {
            socket: client,
            user,
        };
    }

    removeClient(id: string) {
        delete this.connectedClients[id];
    }

    getNumConnectedClients(): string[] {
        return Object.keys(this.connectedClients);
    }

    getUserFullName(clientId: string): string {
        const clientData = this.connectedClients[clientId];
        return clientData.user.fullName;
    }

    checkUserConnection(userId: string) {
        for(const clientId of Object.keys(this.connectedClients)) {
            const connectedClient = this.connectedClients[clientId];
            if(connectedClient.user.id === userId) {
                connectedClient.socket.disconnect();
                break;
            }
        }
    }
}
