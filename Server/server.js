const config = require('./config.json');
const socket = require('socket.io')();
const {
    getVelocity,
    GenerateRoomID
} = require('./Utils');
const {
    ClientEvents,
    ServerEvents
} = require('./Shared/enums');

const Engine = require('./GameEngine');
const PORT = 3000;
const FPS = 20;



const currentGames = {};
const gameCurrentRooms = {};

socket.on('connection', async client => {

    //client callbacks
    client.on(ClientEvents.KEY_PRESS, HandlePlayerKeyPress)
    client.on(ClientEvents.NEW_GAME, HandleNewGame);
    client.on(ClientEvents.JOIN_GAME, HandlePlayerJoin);
    client.on(ClientEvents.ON_PLAYER_DISCONNECT, HandlePlayerDisconnect);
    client.on(ClientEvents.REQUEST_LOBBY, HandleLobbyRequests);


    client.number = 1;



    /* client.emit('init',JSON.stringify(packet));
     GameIntervals(client,packet);
     */

    function HandleNewGame() {
        let roomID = GenerateRoomID();
        gameCurrentRooms[client.id] = roomID;
        client.emit(ServerEvents.GAME_CODE,roomID);


        //creating new packet object
        let GameInfo = {};
        GameInfo.Packet = Engine.CreatePacket();
        currentGames[roomID] = GameInfo;

        client.join(roomID);
        console.log('player Created NewGame');

        //set to one because its the first player to create the room
        client.number = 1;
        //set player id on client
        client.emit(ServerEvents.INIT, 1);
    }


    function HandlePlayerJoin(roomID) {



        console.log(`player joined new room ${roomID}`);
        gameCurrentRooms[client.id] = roomID;
        client.join(roomID);
        client.number = 2;
        client.emit(ServerEvents.INIT, 2);
        StartCountdown(roomID);
    }




    function HandlePlayerKeyPress(keyCode) {
        const roomID = gameCurrentRooms[client.id];
        const key = parseInt(keyCode);
        if (!roomID) {
            return;
        }

        const velocity = getVelocity(key);
        currentGames[roomID]['Packet'].Players[client.number - 1].velocity = velocity;

    }

    function HandlePlayerDisconnect() {

        //game end
        const winner = client.number == 1 ? 2 : 1;
        const roomID = gameCurrentRooms[client.id]
        const room = socket.sockets.adapter.rooms.get(roomID);
        if (currentGames[roomID]) return; //game already finished just quit 

        //leave current room
        client.leave(roomID);
        //Clear game loop
        clearInterval(currentGames[roomID]['UpdateLoop']);
        //set winner
        socket.sockets.in(roomID).emit(ServerEvents.GAME_END, winner);

        //clear the room
        for (const clientID of room) {
            const clientSocket = socket.sockets.sockets.get(clientID);
            clientSocket.leave(roomID);
        }
        gameCurrentRooms[client.id] = null;
        currentGames[roomID] = null;
    }

    function HandleLobbyRequests() {

        const currentRooms = {};
        if (gameCurrentRooms) {
            for (const key in gameCurrentRooms) {
                const roomID = gameCurrentRooms[key];
                const room = socket.sockets.adapter.rooms.get(roomID);
                const numClients = room ? room.size : 0;
                if (numClients > 0) {
                    let playerCount = numClients;
                    let roomInfo = {};
                    roomInfo['id'] = gameCurrentRooms[key];
                    roomInfo['playerCount'] = playerCount;
                    roomInfo['end'] = false;
                    currentRooms[key] = roomInfo;
                }
            }
            socket.emit(ServerEvents.CURRENT_ROOMS, JSON.stringify(currentRooms));
        }

    }
});


function StartCountdown(roomID) {


    let counter = 10;
    socket.sockets.in(roomID).emit(ServerEvents.TIMER, counter);
    const countdown = setInterval(() => {
        counter--;
        socket.sockets.in(roomID).emit(ServerEvents.TIMER, counter);
        if (counter <= 0) {
            socket.sockets.in(roomID).emit(ServerEvents.GAME_STARTED);
            GameIntervals(roomID);
            clearInterval(countdown);
        }
    }, 1000);


}


function GameIntervals(roomID) {

    const packet = currentGames[roomID]['Packet'];
    currentGames[roomID]['UpdateLoop'] = setInterval(() => {
        Engine.GameLoop(packet);
        socket.sockets.in(roomID).emit(ServerEvents.GAME_UPDATE_LOOP, JSON.stringify(packet));
    }, 1000 / config.gameSettings.fps);
}

socket.listen(config.port);