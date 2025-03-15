import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  PanResponder,
  Animated,
  Dimensions,
  Text,
} from "react-native";

interface Props<T extends Record<string, unknown>> {
  Card: React.ComponentType<T>;
  data: T[];
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  requestUpdate: () => Promise<any[]>;
  style?: object;
}

export default function SwipeHandler<T extends Record<string, unknown>>({
  Card,
  data,
  onSwipeRight,
  onSwipeLeft,
  requestUpdate,
  style,
}: Props<T>) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [curIndex, setCurIndex] = useState(0);
  const [currentData, setCurrentData] = useState(data);
  const SCREEN_WIDTH = Dimensions.get("window").width;

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const swipeThreshold = SCREEN_WIDTH / 2;

        if (Math.abs(dx) > swipeThreshold) {
          Animated.timing(pan, {
            toValue: { x: dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, y: dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            if (dx > 0) {
              onSwipeRight();
            } else {
              onSwipeLeft();
            }

            requestUpdate().then((newUsers) => {
              setCurrentData((prevData) => [...prevData, ...newUsers]);
            });

            setCurIndex((prevIndex) => prevIndex + 1);
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const renderCard = (index: number) => {
    const currentCardStyle = {
      transform: [
        { translateX: pan.x },
        { translateY: pan.y },
        {
          rotate: pan.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: ["-10deg", "0deg", "10deg"],
            extrapolate: "clamp",
          }),
        },
      ],
      opacity: pan.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: [0.8, 1, 0.8],
        extrapolate: "clamp",
      }),
      zIndex: 1,
    };

    const nextCardStyle = {
      transform: [
        { translateX: 0 },
        { translateY: 0 },
        {
          scale: pan.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1.0, 0.8, 1.0],
            extrapolate: "clamp",
          }),
        },
      ],
      opacity: 1,
      zIndex: 0,
    };

    return (
      <>
        <Animated.View
          style={[styles.cardContainer, currentCardStyle]}
          {...panResponder.panHandlers}
        >
          <Card {...currentData[index]} />
        </Animated.View>

        {index + 1 < currentData.length && (
          <Animated.View style={[styles.cardContainer, nextCardStyle]}>
            <Card {...currentData[index + 1]} />
          </Animated.View>
        )}
      </>
    );
  };

  return (
    <View style={StyleSheet.flatten([styles.container, style])}>
      {curIndex < currentData.length && currentData.length > 0 ? (
        renderCard(curIndex)
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Can't find anything right now
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    height: "100%",
    width: "100%",
    position: "absolute",
  },
  emptyStateContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
  },
});
