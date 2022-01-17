module.exports = {
    GameLoop,
    CreatePacket
}
const config = require('./config.json');
const paddleMoveSpeed = 1;
const ballMoveSpeed = 1;

const GRID_SIZE_X = 20;
const GRID_SIZE_Y = 20;


function CreatePacket() {
    return {
        Players: [{
                position: {
                    x: 1,
                    y: 7.5
                },
                velocity: {
                    x: 0,
                    y: 0
                },
                length: {
                    x: .5,
                    y: 5
                }

            },
            {
                position: {
                    x: 19,
                    y: 7.5
                },
                velocity: {
                    x: 0,
                    y: 0
                },
                length: {
                    x: .5,
                    y: 5
                }
            }
        ],
        ball: {
            position: {
                x: 10,
                y: 9.5
            },
            velocity: {
                x: -1,
                y: 1
            },
        },
        score: [0, 0]
    };
}

function GameLoop(packet) {
    if (!packet) {
        return;
    }
    const ball = packet.ball;
    const playerOne = packet.Players[0];
    const playerTwo = packet.Players[1];
    PlayerMovement(playerOne);
    PlayerMovement(playerTwo);
    ballLogic(ball, packet);
}

function ballLogic(ball, packet) {


    const desiredVelocityX = ball.velocity.x * ballMoveSpeed;
    const desiredVelocityY = ball.velocity.y * ballMoveSpeed;


    for (const player in packet.Players) {
        var i;
        //5 = paddle length
        for (i = 0; i < 5; i++) {
            if (ball.position.x + desiredVelocityX == packet.Players[player].position.x
                 && packet.Players[player].position.y + i == ball.position.y + desiredVelocityY) {
                ball.velocity.x *= -1;
                ball.velocity.y *= -1;
                break;
            }
        }
    }

    if (ball.position.x + desiredVelocityX < 1) {

        ball.velocity.x *= -1;
        packet.score[1]++;
        //restart
    }
    if (ball.position.x + desiredVelocityX > GRID_SIZE_X - 1) {
        ball.velocity.x *= -1;
        packet.score[0]++;
        //restart
    }
    if (ball.position.y + desiredVelocityY < 1 || ball.position.y + desiredVelocityY > GRID_SIZE_Y - 1)
        ball.velocity.y *= -1;

    ball.position.x += desiredVelocityX;
    ball.position.y += desiredVelocityY;
}

function PlayerMovement(player) {
    if (player.position.y + player.velocity.y < 0 || player.position.y + player.velocity.y > GRID_SIZE_Y - player.length.y) {
        return;
    }
    player.position.y += player.velocity.y;
}