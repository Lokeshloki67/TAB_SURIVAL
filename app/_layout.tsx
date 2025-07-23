import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 50;
const OBSTACLE_SIZE = 60;
const GRAVITY = 3;
const GAME_OVER_Y = height - PLAYER_SIZE;
const JUMP_FORCE = -20;
const OBSTACLE_SPEED = 4000;

export default function Game() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerY, setPlayerY] = useState(height / 2);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const obstacleX = useRef(new Animated.Value(width)).current;
  const obstacleY = useRef(new Animated.Value(Math.random() * (height - OBSTACLE_SIZE))).current;

  const velocity = useRef(0);
  const lastJumpTime = useRef(Date.now());

  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    const gameInterval = setInterval(() => {
      setPlayerY(prev => {
        let newY = prev + velocity.current;

        if (newY > GAME_OVER_Y) {
          newY = GAME_OVER_Y;
          setGameOver(true);
        }

        if (newY < 0) {
          newY = 0;
          setGameOver(true);
        }

        return newY;
      });

      velocity.current += GRAVITY;

      if (Date.now() - lastJumpTime.current > 2000) {
        setGameOver(true);
      }
    }, 50);

    return () => clearInterval(gameInterval);
  }, [gameOver, isGameStarted]);

  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    Animated.timing(obstacleX, {
      toValue: -OBSTACLE_SIZE,
      duration: OBSTACLE_SPEED,
      useNativeDriver: false,
    }).start(() => {
      if (!gameOver) {
        setScore(prev => prev + 1);
        obstacleX.setValue(width);
        obstacleY.setValue(Math.random() * (height - OBSTACLE_SIZE));
      }
    });
  }, [score, gameOver, isGameStarted]);

  useEffect(() => {
    if (!isGameStarted) return;
    const checkCollision = setInterval(() => {
      if (
        obstacleX._value < width / 4 + PLAYER_SIZE &&
        obstacleX._value + OBSTACLE_SIZE > width / 4 &&
        obstacleY._value < playerY + PLAYER_SIZE &&
        obstacleY._value + OBSTACLE_SIZE > playerY
      ) {
        setGameOver(true);
      }
    }, 50);

    return () => clearInterval(checkCollision);
  }, [playerY, gameOver, isGameStarted]);

  const jump = () => {
    if (gameOver || !isGameStarted) return;
    velocity.current = JUMP_FORCE;
    lastJumpTime.current = Date.now();
  };

  const startGame = () => {
    setIsGameStarted(true);
    setGameOver(false);
    setPlayerY(height / 2);
    setScore(0);
    velocity.current = 0;
    obstacleX.setValue(width);
    obstacleY.setValue(Math.random() * (height - OBSTACLE_SIZE));
    lastJumpTime.current = Date.now();
  };

  const restartGame = () => {
    setIsGameStarted(false);
    setGameOver(false);
    setScore(0);
    setPlayerY(height / 2);
    velocity.current = 0;
    obstacleX.setValue(width);
    obstacleY.setValue(Math.random() * (height - OBSTACLE_SIZE));
    lastJumpTime.current = Date.now();
  };

  return (
    <View style={styles.container}>
      {!isGameStarted ? (
        <View style={styles.startScreen}>
          <Text style={styles.title}>🟦 Tap Survival</Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      ) : !gameOver ? (
        <TouchableOpacity style={styles.gameArea} onPress={jump}>
          <Animated.View style={[styles.player, { top: playerY }]} />
          <Animated.View style={[styles.obstacle, { left: obstacleX, top: obstacleY }]} />
          <Text style={styles.score}>Score: {score}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.gameOverScreen}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
            <Text style={styles.restartText}>Restart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  title: {
    fontSize: 30,
    color: '#00ccff',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#00ccff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  startText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  player: {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    backgroundColor: 'cyan',
    position: 'absolute',
    left: width / 4,
    borderRadius: 8,
  },
  obstacle: {
    width: OBSTACLE_SIZE,
    height: OBSTACLE_SIZE,
    backgroundColor: 'red',
    position: 'absolute',
    borderRadius: 8,
  },
  score: {
    position: 'absolute',
    top: 40,
    left: 20,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameOverScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  gameOverText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  finalScore: {
    fontSize: 20,
    color: 'yellow',
    marginVertical: 10,
  },
  restartButton: {
    padding: 15,
    backgroundColor: '#00ccff',
    borderRadius: 10,
    marginTop: 20,
  },
  restartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
