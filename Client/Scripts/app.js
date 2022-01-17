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

// game panels
const gameScreen = document.getElementById('gameScreen');
const titleScreen = document.getElementById('titleScreen');
const lobbyScreen = document.getElementById('lobbyScreen');

const roomsContainer = document.getElementById('roomsContainer');
const roomElement = document.getElementById('roomElement');

const startBtn = document.getElementById('startBtn');
const joinBtn = document.getElementById('joinBtn');
const backBtn = document.getElementById('backBtn');
const quitBtn = document.getElementById('quitBtn');

startBtn.addEventListener('click', OnStartButton);
joinBtn.addEventListener('click', OnJoinButton);
backBtn.addEventListener('click', OnBackButton);
quitBtn.addEventListener('click', OnQuitButton);


const p1Score = document.getElementById('p1');
const p2Score = document.getElementById('p2');

const BG_COLOR = '#1d1d1d';
const PADDLE_COLOR = '#f7f7f7';
const canvasWidth = 600;
const canvasHeight = 300;
const GRID_SIZE_X = 20;
const GRID_SIZE_Y = 20;

var connectionOptions = {
  "force new connection": true,
  "reconnectionAttempts": "Infinity",
  "timeout": 10000,
  "transports": ["websocket"]
};

const socket = io('http://localhost:3000', connectionOptions);



let canvas;
let ctx;
let playerID;
let gameStarted = false;

let currentRoomsUI = [];

//server callbacks
socket.on(ServerEvents.INIT, handleInit);
socket.on(ServerEvents.GAME_STARTED, GameStarted);
socket.on(ServerEvents.GAME_UPDATE_LOOP, handleGameLoop);
socket.on(ServerEvents.CURRENT_ROOMS, handleLobbyRooms);
socket.on(ServerEvents.TIMER, GameCountdown);
socket.on(ServerEvents.GAME_END, handleGameEND);

socket.on(ServerEvents.GAME_CODE, (code) => {
  console.log(`code recived ${code}`);
});


function OnStartButton() {
  socket.emit(ClientEvents.NEW_GAME);
}

function OnJoinButton() {
  gameScreen.style.display = "none";
  titleScreen.style.display = "none";
  lobbyScreen.style.display = "block";
  socket.emit(ClientEvents.REQUEST_LOBBY);
}

function OnBackButton() {
  gameScreen.style.display = "none";
  titleScreen.style.display = "block";
  lobbyScreen.style.display = "none";
}

function OnQuitButton() {
  gameScreen.style.display = "none";
  titleScreen.style.display = "block";
  lobbyScreen.style.display = "none";
  socket.emit(ClientEvents.ON_PLAYER_DISCONNECT);
  gameStarted = false;
  playerID = null;
}



function handleLobbyRooms(rooms) {

  rooms = JSON.parse(rooms);
  console.log(rooms);
  var elm_clone = roomElement.cloneNode(true);
  roomElement.remove();

  //console.log(currentRoomsUI);

  for (var i = 0; i < currentRoomsUI; i++) {
    console.log(currentRoomsUI[i]);
    //Do something
  }
  for (const Room_ui in currentRoomsUI) {
    //Room_ui.remove();
    // console.log(elm_clone);
    //console.log(Room_ui);
    // roomsContainer.removeChild(Room_ui);
  }

  currentRoomsUI = [];

  for (const room in rooms) {
    if (rooms[room] != null || rooms[room].end) {
      const roomElement = rooms[room];
      const playerCount = roomElement.playerCount;
      const roomID = roomElement.id;
      elm_clone.querySelector("#RoomText").innerText = `${playerCount}/2`;
      var joinRoomButton = elm_clone.querySelector("#joinRoombtn");
      if (playerCount < 2) {
        joinRoomButton.addEventListener('click', () => TryJoinRoom(roomID));
      } else {
        joinRoomButton.remove();
      }

      currentRoomsUI.push(elm_clone);
      roomsContainer.appendChild(elm_clone);
    }
  }
}


function TryJoinRoom(roomID) {
  socket.emit(ClientEvents.JOIN_GAME, roomID);
}

function handleInit(id) {
  /*
  Paint(JSON.parse(packet));
  */
  init();
  gameScreen.style.display = "block";
  gameScreen.querySelector('#gameState').innerHTML = ' waiting for other players to join';
  titleScreen.style.display = "none";
  playerID = id;
}

function handleGameEND(winner) {
  let winnerText = winner == playerID ? 'YOU WON!!' : 'YOU LOSE'
  init();
  gameScreen.querySelector('#gameState').innerHTML = winnerText;
}

function GameCountdown(timer) {
  gameScreen.style.display = "block";
  gameScreen.querySelector('#gameState').innerHTML = `Game Starting in: ${timer}`;
  titleScreen.style.display = "none";
}

function GameStarted() {
  document.addEventListener('keydown', HandleKeyPress);
  gameScreen.querySelector('#gameState').innerHTML = ``;
}

function init() {
  gameScreen.style.display = "block";
  titleScreen.style.display = "none";
  lobbyScreen.style.display = "none";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  p1Score.innerText = '0';
  p2Score.innerText = '0';
  ctx.fillStyle = BG_COLOR;

  ctx.fillRect(0, 0, canvas.width, canvas.height);
}



function Paint(_packet) {

  if (_packet === null) {

    console.log('packet is null');
    return;
  }

  ctx.fillStyle = BG_COLOR;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const playerOne = _packet.Players[0];
  const playerTwo = _packet.Players[1];
  const sizeX = canvasWidth / GRID_SIZE_X;
  const sizeY = canvasHeight / GRID_SIZE_Y;

  const ball = _packet.ball;

  p1Score.innerText = _packet.score[0];
  p2Score.innerText = _packet.score[1];


  //ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  const radius = 6;
  ctx.beginPath();

  ctx.arc(ball.position.x * sizeX + radius, ball.position.y * sizeY + radius, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.fillStyle = PADDLE_COLOR;
  ctx.fill();
  //ctx.fillRect(ball.position.x * sizeX, ball.position.y * sizeY, sizeX * .5, sizeX * .5);
  //ctx.stroke();

  drawPlayerPaddle(playerOne);
  drawPlayerPaddle(playerTwo);

}

function drawPlayerPaddle(player){

  const sizeX = canvasWidth / GRID_SIZE_X;
  const sizeY = canvasHeight / GRID_SIZE_Y;
  const radius = 7.5;
  ctx.beginPath();
  ctx.arc(player.position.x * sizeX + radius,player.position.y * sizeY +2, radius, 0, Math.PI + (Math.PI * 0) / 2,1);
  ctx.strokeStyle = 'white';
  ctx.fillStyle = PADDLE_COLOR;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(player.position.x * sizeX + radius,player.position.y * sizeY +  player.length.y*sizeY-2 , radius, 0, Math.PI + (Math.PI * 0) / 2,0);
  ctx.strokeStyle = 'white';
  ctx.fillStyle = PADDLE_COLOR;
  ctx.fill();
  ctx.fillRect(player.position.x * sizeX , player.position.y * sizeY, player.length.x * sizeX, player.length.y * sizeY);
}

function handleGameLoop(packet) {
  const _packet = JSON.parse(packet);
  requestAnimationFrame(() => Paint(_packet));

}

function HandleKeyPress(event) {
  socket.emit(ClientEvents.KEY_PRESS, event.keyCode);
}