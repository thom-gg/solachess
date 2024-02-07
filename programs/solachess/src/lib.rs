use anchor_lang::prelude::*;

mod rules;
mod chess_types;
mod init_grid;
use crate::init_grid::init_grid;
use crate::chess_types::{Tile, Color, Piece};



declare_id!("9ubJZxvjXxfhwZdVmUM4wzTQWCjLTvGDscyamSbk7XUa");

#[program]
pub mod solachess {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.new_account.lastGameId = 0;
        ctx.accounts.new_account.bump = ctx.bumps.new_account;
        Ok(())
    }

    pub fn create_game(ctx: Context<CreateGame>) -> Result<()> {
        msg!("In create game instruction");
        ctx.accounts.game_account.id = ctx.accounts.global_info_account.lastGameId + 1;
        ctx.accounts.global_info_account.lastGameId += 1;

        ctx.accounts.game_account.bump = ctx.bumps.game_account;

        ctx.accounts.game_account.player_white = ctx.accounts.signer.key();
        // leaving player_black to uninitialized
        // leaving winner to uninitialized too
        ctx.accounts.game_account.next_to_play = Color::White;

        // initializing last move coords to 255 because no tiles have these coords
        let mut lastMove = vec![255, 255];
        ctx.accounts.game_account.lastMove = lastMove;

        // init game grid
        // we firstly build and fill in the grid, and then put it in the account data, so it's serialized only once
        let mut grid = init_grid();
        ctx.accounts.game_account.grid = grid;

        Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>, game_id: u64) -> Result<()> {
        // assert that there is no player black yet (player white has to be here since he created the game)
        assert!(
            ctx.accounts
                .game_account
                .player_black
                .eq(&Pubkey::default())
        );

        // maybe assert that the player joining is different from the player already in ?
        // for now I leave it possible to play against yourself

        msg!("After the assertion, player_black is supposedly default");
        msg!(
            "player_black = {} | default = {}",
            ctx.accounts.game_account.player_black,
            Pubkey::default()
        );
        ctx.accounts.game_account.player_black = ctx.accounts.signer.key();
        msg!(
            "{} succesfully joined the game and is playing black against {}",
            ctx.accounts.game_account.player_black,
            ctx.accounts.game_account.player_white
        );

        Ok(())
    }

    pub fn play(ctx: Context<Play>, game_id: u64, from: u8, to: u8) -> Result<()> {
        // from and to are indexes in the grid
        // check that it's signer turn to play
        assert!(
            (ctx.accounts
                .game_account
                .player_white
                .eq(&ctx.accounts.signer.key())
                && ctx.accounts.game_account.next_to_play == Color::White)
                || (ctx
                    .accounts
                    .game_account
                    .player_black
                    .eq(&ctx.accounts.signer.key())
                    && ctx.accounts.game_account.next_to_play == Color::Black),
            "Its not your turn to play"
        );
        // check that black player joined the game
        assert!(
            !(ctx
                .accounts
                .game_account
                .player_black
                .eq(&Pubkey::default())),
            "The game has not started yet"
        );

        // check that game isnt over
        assert!(
            (ctx.accounts.game_account.winner.eq(&Pubkey::default())),
            "The game is over, you cant play"
        );

        // check that move is legal
        assert!(
            is_move_legal(
                &ctx.accounts.game_account.grid,
                usize::from(from),
                usize::from(to),
                &ctx.accounts.game_account.next_to_play
            ),
            "Illegal move"
        );

        // check win
        if (ctx.accounts.game_account.grid[usize::from(to)].piece == Piece::King) {
            if (ctx.accounts.game_account.grid[usize::from(to)].color == Color::White) {
                ctx.accounts.game_account.winner = ctx.accounts.game_account.player_black;
            } else {
                ctx.accounts.game_account.winner = ctx.accounts.game_account.player_white;
            }
            msg!("{} player won the game !", ctx.accounts.game_account.winner);
        }

        // do move
        ctx.accounts.game_account.grid[usize::from(to)] =
            ctx.accounts.game_account.grid[usize::from(from)].clone();

        ctx.accounts.game_account.grid[usize::from(from)] = Tile {
            piece: Piece::Empty,
            color: Color::White,
        };
        let mut lastMove = vec![from, to];

        ctx.accounts.game_account.lastMove = lastMove;

        // change next_to_play
        if (ctx.accounts.game_account.next_to_play == Color::White) {
            ctx.accounts.game_account.next_to_play = Color::Black;
        } else {
            ctx.accounts.game_account.next_to_play = Color::White;
        }
        Ok(())
    }

}

fn is_move_legal(grid: &Vec<Tile>, from: usize, to: usize, colorPlaying: &Color) -> bool {
    if (from < 0 || from >= grid.len() || to < 0 || to >= grid.len()) {
        return false;
    }
    let startingTile = &grid[from];
    if (startingTile.piece == Piece::Empty || &startingTile.color != colorPlaying) {
        return false;
    }

    let destinationTile = &grid[to];
    if (destinationTile.piece != Piece::Empty && &destinationTile.color == colorPlaying) {
        return false;
    }

    // implement all chess rules here

    return true;
}



#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 8 bytes come from NewAccount.data being type u64.
    // (u64 = 64 bits unsigned integer = 8 bytes)
    #[account(init, payer = signer, space = 8 + 8 + 1, seeds = [b"GLOBAL_INFO"], bump)]
    pub new_account: Account<'info, GlobalInfo>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(mut, seeds = [b"GLOBAL_INFO"], bump = global_info_account.bump)]
    pub global_info_account: Account<'info, GlobalInfo>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init, payer = signer, space = 8 + GameAccount::MAX_SIZE, seeds=[b"GAME", (global_info_account.lastGameId + 1).to_be_bytes().as_ref()], bump)]
    pub game_account: Account<'info, GameAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(gameId: u64)]
pub struct JoinGame<'info> {
    #[account(mut, seeds = [b"GAME", (gameId).to_be_bytes().as_ref()], bump = game_account.bump)]
    game_account: Account<'info, GameAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(gameId: u64, from: u8, to: u8)]
pub struct Play<'info> {
    #[account(mut, seeds= [b"GAME", (gameId).to_be_bytes().as_ref()], bump = game_account.bump)]
    game_account: Account<'info, GameAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[account]
pub struct GlobalInfo {
    lastGameId: u64,
    bump: u8,
}

#[account]
pub struct GameAccount {
    id: u64,              // 8 bytes
    bump: u8,             // 1 byte
    player_white: Pubkey, // 32 bytes
    player_black: Pubkey, // 32 bytes
    winner: Pubkey,       // 32 bytes
    lastMove: Vec<u8>,    // 1 byte per u8, 2 u8 in the Vec, 4 bytes to store Vec size, so 6 bytes
    next_to_play: Color,  // 1 byte: 0 = white, 1 = black
    grid: Vec<Tile>, // 2 bytes per tile, 64 tiles. Each Vec needs 4 bytes to store the size, so having Vec<Vec<Tile>> would waste space
}

impl GameAccount {
    pub const MAX_SIZE: usize = 8 + 1 + 32 + 32 + 32 + (4 + (1 * 2)) + 1 + (4 + (2 * 64));
}


