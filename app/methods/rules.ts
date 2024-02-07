import { PieceColor, PieceType } from "../components/Chessboard";

function isABetweenBC(a, b, c) {
    if (b < c && a > b && a < c) {
        return true;
    }
    if (b > c && a < b && a > c) {
        return true;
    }
    return false;
}



export function isMoveLegal(startX, startY, endX, endY, pieceType, pieceColor, pieces, nextToPlay) {
    console.log("CHECKING LEGALITY FROM (" + startX + "," + startY + ") to (" + endX + "," + endY + ")");
    if (endX > 7 || endX < 0 || endY > 7 || endY < 0) {
        return false;
    }
    let startingPiece = null;
    let endingPiece = null;
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].x === startX && pieces[i].y === startY) {
            startingPiece = pieces[i];
        }
        if (pieces[i].x === endX && pieces[i].y === endY) {
            endingPiece = pieces[i];
        }
    }

    if (endingPiece && startingPiece.pieceColor === endingPiece.pieceColor) {
        return false;
    }
    if (startingPiece.pieceColor != nextToPlay) {
        return false;
    }

    // pawn rules
    function pawnRules() {
        if (endingPiece) {  // if there is an ending piece, it has to be in diagonal
            console.log("end y starty endx startx " + endY + " " + startY + " " + endX + " " + startX);
            if (Math.abs(endX - startX) === 1 &&
                (endY - startY === 1 && pieceColor === PieceColor.White) || (endY - startY === -1 && pieceColor === PieceColor.Black) ) {
                return true;
            }
            console.log("check1");
            return false;
        }
        if (startX != endX) { // if its not eating, it has to go straight
            console.log("check2");

            return false;
        }
        if (pieceColor === PieceColor.White && endY === startY + 1 || (endY === startY + 2 && startY === 1)) {
            return true;
        }
        if (pieceColor === PieceColor.Black && endY === startY - 1 || (endY === startY - 2 && startY === 6)) {
            return true;
        }
        return false;
    }



    // rook rules
    function rookRules() {
        if (startX === endX) {
            // parcourir toutes les pieces, et si y'en qui ont le meme X, si elles ont un Y entre startX et endX alors false
            for (let i = 0; i < pieces.length; i++) {
                if (pieces[i].x === startX) {
                    if (isABetweenBC(pieces[i].y, startY, endY)) {
                        return false;
                    }
                }
            }
            return true;
        }

        if (startY === endY) {

            for (let i = 0; i < pieces.length; i++) {
                if (pieces[i].y === startY) {
                    if (isABetweenBC(pieces[i].x, startX, endX)) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    // bishop rules
    function bishopRules() {
        let offsetX = endX - startX;
        let offsetY = endY - startY;

        // offset are equals if the piece is going diagonal
        if (Math.abs(offsetX) != Math.abs(offsetY)) {
            return false;
        }

        let goingDown = endY < startY;
        let goingLeft = endX < startX;

        let tmpX = startX;
        let tmpY = startY;

        // check there was no pieces on the way
        // Math.abs(offsetX) - 1 checks because we dont check the last one, who is allowed to have a piece on it
        // (in case we are eating a piece)
        for (let i = 0; i < Math.abs(offsetX) - 1; i++) {

            if (goingDown) { tmpY -= 1; }
            else { tmpY += 1; }
            if (goingLeft) { tmpX -= 1; }
            else { tmpX += 1; }

            // check that there is no pieces on tmpX, tmpY
            for (let i = 0; i < pieces.length; i++) {
                if (pieces[i].x === tmpX && pieces[i].y === tmpY) {

                    return false;
                }
            }
        }

        return true;
    }


    function knightRules() {
        // can jump over pieces so only need to check the moving itself is legal
        // should either move 2 tiles x and 1 tile y, or 2  tiles y and 1 tile x
        if (Math.abs(endX - startX) === 2 && Math.abs(endY - startY) === 1) {
            return true;
        }
        if (Math.abs(endX - startX) === 1 && Math.abs(endY - startY) === 2) {
            return true;
        }
        return false;
    }

    function queenRules() {
        // a queen moves either like a rook or a bishop
        return rookRules() || bishopRules()
    }

    function kingRules() {
        // diagonal move
        if (Math.abs(startX - endX) === 1 && Math.abs(startY - endY) === 1) {
            return true;
        }

        // straight line move
        if (Math.abs(startX - endX) === 1 && (startY === endY)) {
            return true;
        }
        if (Math.abs(startY - endY) === 1 && (startX === endX)) {
            return true;
        }
        return false;
    }

    if (pieceType === PieceType.Pawn) {
        return pawnRules();
    }

    if (pieceType === PieceType.Rook) {
        return rookRules();
    }

    if (pieceType === PieceType.Bishop) {
        return bishopRules();
    }

    if (pieceType === PieceType.Knight) {
        return knightRules();
    }

    if (pieceType === PieceType.Queen) {
        return queenRules();
    }

    if (pieceType === PieceType.King) {
        return kingRules()
    }


    // should never be there, but in case, this means there's something wrong so move illegal
    return false;
}
