import React, { useState } from "react";
import styled from "styled-components";
import { DIMS, PLAYER_X, PLAYER_O, SQUARE_DIMS, DRAW } from "./constants";
import { getRandomInt } from "./utils";
import { GAME_STATES } from "./constants";
import { switchPlayer } from "./utils";
import { useEffect } from "react";
import { useCallback } from "react";
import { minimax } from "./minimax";
import Board from "./board"
import {GAME_MODES} from './constants';




const board = new Board();


const arr = new Array(DIMS ** 2).fill(null);

const TicTacToe = () => {
  const [grid, setGrid] = useState(arr);

  const [mode, setMode] = useState(GAME_MODES.medium)

  const [nextMove, setNextMove] = useState(null);

  const [players, setPlayers] = useState({
    human: null,
    computer: null
  });

  const [gameState, setGameState] = useState(GAME_STATES.notStarted);

  const move = useCallback(
    (index, player) => {
      if (player && gameState === GAME_STATES.inProgress) {
        setGrid(grid => {
          const gridCopy = grid.concat();
          gridCopy[index] = player;
          return gridCopy;
        });
      }
    },
    [gameState]
  );

  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const winner = board.getWinner(grid);
    const declareWinner = winner => {
      let winnerStr;
      switch (winner) {
        case PLAYER_X:
          winnerStr = "Player X wins!";
          break;
        case PLAYER_O:
          winnerStr = "Player O wins!";
          break;
        case DRAW:
        default:
          winnerStr = "It's a draw";
      }
      setGameState(GAME_STATES.over);
      setWinner(winnerStr);
    };

    if (winner !== null && gameState !== GAME_STATES.over) {
      declareWinner(winner);
    }
  }, [gameState, grid, nextMove]);



  const computerMove = useCallback(() => {
    // Important to pass a copy of the grid here
    const board = new Board(grid.concat());
    const emptyIndices = board.getEmptySquares(grid);
    let index;

    switch (mode) {
      case GAME_MODES.easy:
        index = getRandomInt(0, 8);
        while (!emptyIndices.includes(index)) {
          index = getRandomInt(0, 8);
        }
        break;
      case GAME_MODES.medium:
        // Medium level is basically ~half of the moves are minimax and the other ~half random
        const smartMove = !board.isEmpty(grid) && Math.random() < 0.5;
        if (smartMove) {
          index = minimax(board, players.computer)[1];
        } else {
          index = getRandomInt(0, 8);
          while (!emptyIndices.includes(index)) {
            index = getRandomInt(0, 8);
          }
        }
        break;
      case GAME_MODES.difficult:
      default:
        index = board.isEmpty(grid)
          ? getRandomInt(0, 8)
          : minimax(board, players.computer)[1];
    }
    if (!grid[index]) {
      move(index, players.computer);
      setNextMove(players.human);
    }
  }, [move, grid, players, mode]);

  const changeMode = e => {
    setMode(e.target.value);
  };


  const humanMove = index => {
    if (!grid[index] && nextMove === players.human) {
      move(index, players.human);
      setNextMove(players.computer);
    }
  };


  useEffect(() => {
    let timeout;
    if (
      nextMove !== null &&
      nextMove === players.computer &&
      gameState !== GAME_STATES.over
    ) {
      
      timeout = setTimeout(() => {
        computerMove();
      }, 500);
    }
    return () => timeout && clearTimeout(timeout);
  }, [nextMove, computerMove, players.computer, gameState]);



  const choosePlayer = option => {
    setPlayers({ human: option, computer: switchPlayer(option) });
    setGameState(GAME_STATES.inProgress);
    setNextMove(PLAYER_X); // Set the Player X to make the first move
  };

  const startNewGame = () => {
    setGameState(GAME_STATES.notStarted);
    setGrid(arr);
  };


  switch (gameState) {
    case GAME_STATES.notStarted:
        default:
          return (
            <Screen>
              <Inner>
                <ChooseText>Select difficulty</ChooseText>
                <select onChange={changeMode} value={mode}>
                  {Object.keys(GAME_MODES).map(key => {
                    const gameMode = GAME_MODES[key];
                    return (
                      <option key={gameMode} value={gameMode}>
                        {key}
                      </option>
                    );
                  })}
                </select>
              </Inner>
              <Inner>
                <ChooseText>Choose your player</ChooseText>
                <ButtonRow>
                  <button onClick={() => choosePlayer(PLAYER_X)}>X</button>
                  <p>or</p>
                  <button onClick={() => choosePlayer(PLAYER_O)}>O</button>
                </ButtonRow>
              </Inner>
            </Screen>
          );
    case GAME_STATES.inProgress:
      return (
        <Container dims={DIMS}>
          {grid.map((value, index) => {
            const isActive = value !== null;
  
            return (
              <Square
                key={index}
                onClick={() => humanMove(index)}
              >
                {isActive && <Marker>{value === PLAYER_X ? "X" : "O"}</Marker>}
              </Square>
            );
          })}
        </Container>
      );
    case GAME_STATES.over:
      return (
        <div>
          <p>{winner}</p>
          <button onClick={startNewGame}>Start over</button>
        </div>
      );
  }
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  width: ${({ dims }) => `${dims * (SQUARE_DIMS + 5)}px`};
  flex-flow: wrap;
  position: relative;
`;

const Square = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${SQUARE_DIMS}px;
  height: ${SQUARE_DIMS}px;
  border: 1px solid black;
  &:hover {
    cursor: pointer;
  }
`;

const Marker = styled.p`
  font-size: 68px;
`;

const ButtonRow = styled.div`
  display: flex;
  width: 150px;
  justify-content: space-between;
`;

const Screen = styled.div``;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const ChooseText = styled.p``;

export default TicTacToe;