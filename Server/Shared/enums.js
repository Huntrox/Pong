
const ClientEvents = {
    KEY_PRESS: 'KeyPress',
    NEW_GAME: 'newGame',
    JOIN_GAME: 'joinGame',
    ON_PLAYER_DISCONNECT: 'onPlayerDisconnect',
    REQUEST_LOBBY: 'requestLobby',
}
const ServerEvents = {
    INIT: 'init',
    GAME_STARTED: 'gameStarted',
    GAME_UPDATE_LOOP: 'gameUpdateLoop',
    CURRENT_ROOMS: 'currentRooms',
    TIMER:'timer',
    GAME_END:'gameEND',
    GAME_CODE:'gameCode',
}
module.exports = {
    ServerEvents,
    ClientEvents
}