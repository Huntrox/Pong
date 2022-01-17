
//get player direction based on key input
function getVelocity(keyCode) {
    switch (keyCode) {
        case 38: { //arrowKey down
            return {
                x: 0,
                y: -1
            };
        }
        case 40: { //arrowKey up
            return {
                x: 0,
                y: 1
            };
        }
        case 87: { // S
            return {
                x: 0,
                y: -1
            };
        }
        case 83: { // W
            return {
                x: 0,
                y: 1
            };
        }
        default:
            return {
                x: 0, y: 0
            };

    }
}
function GenerateRoomID(){
    return '_' + Math.random().toString(36).substr(2, 9);
};
module.exports = {
    getVelocity,
    GenerateRoomID
}