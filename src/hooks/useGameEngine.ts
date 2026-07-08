'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';

export type GamePhase = 'EXPOSURE' | 'DISTRACTOR' | 'RECOVERY';

interface GameState {
  phase: GamePhase;
  timeLeft: number | null; // null during RECOVERY
  neuralEnergy: number;
  isCompleted: boolean;
  wrongSelections: string[];
}

type GameAction =
  | { type: 'TICK' }
  | { type: 'SKIP_EXPOSURE' }
  | { type: 'SELECT_WRONG'; option: string }
  | { type: 'SELECT_CORRECT' }
  | { type: 'RESET' };

const INITIAL_STATE: GameState = {
  phase: 'EXPOSURE',
  timeLeft: 30,
  neuralEnergy: 100,
  isCompleted: false,
  wrongSelections: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TICK': {
      if (state.timeLeft === null) return state;
      const nextTime = state.timeLeft - 1;

      if (nextTime <= 0) {
        if (state.phase === 'EXPOSURE') {
          return {
            ...state,
            phase: 'DISTRACTOR',
            timeLeft: 8, // Phase 2: exactly 8s
          };
        } else if (state.phase === 'DISTRACTOR') {
          return {
            ...state,
            phase: 'RECOVERY',
            timeLeft: null, // Phase 3: free time
          };
        }
      }

      return {
        ...state,
        timeLeft: nextTime,
      };
    }

    case 'SKIP_EXPOSURE': {
      if (state.phase !== 'EXPOSURE') return state;
      return {
        ...state,
        phase: 'DISTRACTOR',
        timeLeft: 8,
      };
    }

    case 'SELECT_WRONG': {
      if (state.phase !== 'RECOVERY' || state.isCompleted) return state;
      return {
        ...state,
        neuralEnergy: Math.max(0, state.neuralEnergy - 25),
        wrongSelections: [...state.wrongSelections, action.option],
      };
    }

    case 'SELECT_CORRECT': {
      if (state.phase !== 'RECOVERY') return state;
      return {
        ...state,
        isCompleted: true,
      };
    }

    case 'RESET':
      return INITIAL_STATE;

    default:
      return state;
  }
}

export function useGameEngine(correctAnswer: string, onComplete?: (finalScore: number) => void) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const onCompleteRef = useRef(onComplete);

  // Keep callback reference updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Hook interval execution
  useEffect(() => {
    if (state.isCompleted || state.timeLeft === null) return;

    const intervalId = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [state.phase, state.timeLeft, state.isCompleted]);

  const skipExposure = useCallback(() => {
    dispatch({ type: 'SKIP_EXPOSURE' });
  }, []);

  const submitAnswer = useCallback(
    (selection: string) => {
      if (selection === correctAnswer) {
        dispatch({ type: 'SELECT_CORRECT' });
        if (onCompleteRef.current) {
          onCompleteRef.current(state.neuralEnergy);
        }
        return true;
      } else {
        dispatch({ type: 'SELECT_WRONG', option: selection });
        return false;
      }
    },
    [correctAnswer, state.neuralEnergy]
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    phase: state.phase,
    timeLeft: state.timeLeft,
    neuralEnergy: state.neuralEnergy,
    isCompleted: state.isCompleted,
    wrongSelections: state.wrongSelections,
    skipExposure,
    submitAnswer,
    reset,
  };
}
