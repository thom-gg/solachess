use anchor_lang::prelude::*;




#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct Tile {
    pub piece: Piece, // 1 byte
    pub color: Color, // 1 byte
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Piece {
    Empty, // if this tile has no piece on it, we consider it has an Empty piece (and color doesnt matter)
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Color {
    White,
    Black,
}

impl Color {
    pub fn toString(&self) -> &str {
        match self {
            Color::White => "White",
            Color::Black => "Black",
        }
    }
}