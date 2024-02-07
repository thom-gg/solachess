use crate::chess_types::{Tile, Color, Piece};

fn is_x_between_y_z(x: usize, y: usize, z: usize) -> bool {
    if (y < z && x > y && x < z) {
        return true;
    }
    if (y > z && x < y && x > z) {
        return true;
    }
    return false;
}


pub fn is_move_legal(grid: &Vec<Tile>, from: usize, to: usize, colorPlaying: &Color) -> bool {
    
    // check coords arent out of bounds
    if (from < 0 || from >= grid.len() || to < 0 || to >= grid.len()) {
        return false;
    }

    let startX: usize = from % 8;
    let startY: usize = from / 8;

    let endX: usize = to % 8;
    let endY: usize = to / 8;


    
    let startingTile = &grid[from];
    if (startingTile.piece == Piece::Empty || &startingTile.color != colorPlaying) {
        return false;
    }

    let endingTile = &grid[to];
    if (endingTile.piece != Piece::Empty && &endingTile.color == colorPlaying) {
        return false;
    }

    match startingTile.piece {
        Piece::Empty => return false,  // already checked, only there for the match to be exhaustive
        Piece::Pawn =>  return pawn_rules(startX, startY, endX, endY, startingTile.clone(), endingTile.clone()),
        Piece::Knight => return knight_rules(startX, startY, endX, endY),
        Piece::Bishop => return bishop_rules(startX, startY, endX, endY, grid.clone()),
        Piece::Rook => return rook_rules(startX, startY, endX, endY, grid.clone()),
        Piece::Queen => return (rook_rules(startX, startY, endX, endY, grid.clone()) 
                                    || 
                                bishop_rules(startX, startY, endX, endY, grid.clone())),
        Piece::King => return king_rules(startX, startY, endX, endY),

    }

}

fn pawn_rules(startX: usize, startY: usize, endX: usize, endY: usize, startingTile: Tile, endingTile: Tile) -> bool{
    if (endingTile.piece != Piece::Empty) {  // if eating, has to be in diagonal
        if ((endX as i8) - (startX as i8)).abs() != 1 {
            return false;   // not in diagonal
        }
        // check its going forwards not backwards
        if ( (endY as i8) - (startY as i8)) == 1 && startingTile.color == Color::White {
            return true;
        }
        if ( (endY as i8) - (startY as i8)) == -1 && startingTile.color == Color::Black {
            return true;
        }
        return false;
    }
    // if not eating, can only go one straight, or 2 if it was at starting line
    if startX != endX {
        return false;   // not straight
    }

    if startingTile.color == Color::White {
        // for white pieces, y increasing
        if (endY == startY + 1) {
            return true;
        }
        if (endY == startY + 2 && startY == 1) {
            return true;
        }
        return false;
    }
    else {
        // for black pieces, y decreasing
        if (endY == startY - 1) {
            return true;
        }
        if (endY == startY - 2 && startY == 6) {
            return true;
        }
        return false;
    }
}

fn rook_rules(startX: usize, startY: usize, endX: usize, endY: usize, grid: Vec<Tile>) -> bool {
    if (startX == endX) {
        // iterate on all pieces on the way and check they are all empty
        if (startY < endY) {
            for i in startY+1..endY {
                // (startX, i)
               if grid[(i*8) + startX].piece != Piece::Empty {
                return false;
               }
                
            }
        } 
        else {
            for i in endY-1..startY {
                if grid[(i*8) + startX].piece != Piece::Empty {
                    return false;
                   }
            }
        }
        return true;
    }
    if (startY == endY) {
        if (startX < endX) {
            for i in startX+1..endX {
                if grid[(startY*8 + i)].piece != Piece::Empty {
                    return false;
                }
            }
        }
        else {
            for i in endX-1..startX {
                if grid[(startY*8 + i)].piece != Piece::Empty {
                    return false;
                }
            }
        }
        return true;

    }

    return false;
}

fn bishop_rules(startX: usize, startY: usize, endX: usize, endY: usize, grid: Vec<Tile>) -> bool {
    let offsetX: i8 = (endX as i8) - (startX as i8);
    let offsetY: i8 = (endY as i8) - (startY as i8);

    // should be going diagonal
    if offsetX.abs() != offsetY.abs() {
        return false; 
    }

    // check there is nothing on the way
    let goingDown: bool = endY < startY;
    let goingLeft: bool = endX < startX;

    let mut tmpX: usize = startX;
    let mut tmpY: usize = startY;

    for i in 0..offsetX-1 {
        if (goingDown) { tmpY -= 1;}
        else {tmpY +=1;}

        if (goingLeft) { tmpX -= 1;}
        else {tmpX += 1;}

        if grid[(tmpY*8 + tmpX)].piece != Piece::Empty {
            return false;   // move illegal, there is a piece on the way
        }
    }
    return true;

}

fn knight_rules(startX: usize, startY: usize, endX: usize, endY: usize) -> bool {
        // can jump over pieces so only need to check the moving itself is legal
        // should either move 2 tiles x and 1 tile y, or 2  tiles y and 1 tile x
        if (((endX as i8) - (startX as i8)).abs() == 2 && ( (endY as i8) - (startY as i8)).abs() == 1) {
            return true;
        }
        if (((endX as i8) - (startX as i8)).abs() == 1 && ( (endY as i8) - (startY as i8)).abs() == 2) {
            return true;
        }
        return false;
}

fn king_rules(startX: usize, startY: usize, endX: usize, endY: usize) -> bool {
      // diagonal move
      if ( ((endX as i8) - (startX as i8)).abs() == 1 && ((endY as i8) - (startY as i8)).abs() == 1) {
        return true;
    }

    // straight line move
    if ((endX as i8) - (startX as i8)).abs() == 1 && (startY == endY) {
        return true;
    }
    if ((endY as i8) - (startY as i8)).abs() == 1 && (startX == endX) {
        return true;
    }
    return false;
}