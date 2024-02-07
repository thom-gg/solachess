use crate::chess_types::{Tile, Color, Piece};


pub fn init_grid() -> Vec<Tile> {
    let mut grid = vec![
        Tile {
            piece: Piece::Empty,
            color: Color::White
        };
        64
    ];

    grid[0] = Tile {
        piece: Piece::Rook,
        color: Color::White,
    };
    grid[1] = Tile {
        piece: Piece::Knight,
        color: Color::White,
    };
    grid[2] = Tile {
        piece: Piece::Bishop,
        color: Color::White,
    };
    grid[3] = Tile {
        piece: Piece::Queen,
        color: Color::White,
    };
    grid[4] = Tile {
        piece: Piece::King,
        color: Color::White,
    };
    grid[5] = Tile {
        piece: Piece::Bishop,
        color: Color::White,
    };
    grid[6] = Tile {
        piece: Piece::Knight,
        color: Color::White,
    };
    grid[7] = Tile {
        piece: Piece::Rook,
        color: Color::White,
    };

    for i in 8..16 {
        grid[i] = Tile {
            piece: Piece::Pawn,
            color: Color::White,
        };
        grid[i + 40] = Tile {
            piece: Piece::Pawn,
            color: Color::Black,
        }
    }

    grid[56] = Tile {
        piece: Piece::Rook,
        color: Color::Black,
    };
    grid[57] = Tile {
        piece: Piece::Knight,
        color: Color::Black,
    };
    grid[58] = Tile {
        piece: Piece::Bishop,
        color: Color::Black,
    };
    grid[59] = Tile {
        piece: Piece::Queen,
        color: Color::Black,
    };
    grid[60] = Tile {
        piece: Piece::King,
        color: Color::Black,
    };
    grid[61] = Tile {
        piece: Piece::Bishop,
        color: Color::Black,
    };
    grid[62] = Tile {
        piece: Piece::Knight,
        color: Color::Black,
    };
    grid[63] = Tile {
        piece: Piece::Rook,
        color: Color::Black,
    };

    return grid;
}