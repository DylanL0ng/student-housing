import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  PanResponder,
  Animated,
  Dimensions,
  Text,
} from "react-native";

interface CardItem {
  id: string | number;
  [key: string]: any;
}

interface SwipeHandlerProps<T extends CardItem> {
  Card: React.ComponentType<T>;
  data: T[];
  onSwipeRight: (item: { index: number; data: T }) => void;
  onSwipeLeft: (item: { index: number; data: T }) => void;
  requestUpdate: () => void;
  style?: object;
}

export default function SwipeHandler<T extends CardItem>({
  Card,
  data,
  onSwipeRight,
  onSwipeLeft,
  requestUpdate,
  style,
}: SwipeHandlerProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentData, setCurrentData] = useState(data);
  const isSwipingRef = useRef(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const SCREEN_WIDTH = Dimensions.get("window").width;

  // reset the current data when the data prop changes
  useEffect(() => {
    setCurrentData(data);
    setCurrentIndex(0);
  }, [data]);

  // when the current index exceeds the data length, request an update
  useEffect(() => {
    if (currentIndex >= currentData.length) {
      requestUpdate();
    }
  }, [currentIndex, currentData, requestUpdate]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isSwipingRef.current,

      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isSwipingRef.current) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },

      onPanResponderGrant: () => {
        isSwipingRef.current = true;
      },

      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),

      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const swipeThreshold = SCREEN_WIDTH / 3;

        if (Math.abs(dx) > swipeThreshold) {
          Animated.timing(pan, {
            toValue: { x: dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, y: dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            // handle swipe depending on direction
            const handler = dx > 0 ? onSwipeRight : onSwipeLeft;
            const swipedItem = {
              index: currentIndex,
              data: currentData[currentIndex],
            };

            pan.setValue({ x: 0, y: 0 });

            handler(swipedItem);

            setCurrentIndex(currentIndex + 1);
            isSwipingRef.current = false;
          });
        } else {
          // reset position if swipe is not significant
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start(() => {
            isSwipingRef.current = false;
          });
        }
      },

      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  const renderCards = () => {
    if (!currentData[currentIndex]) return null;

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
      zIndex: 1,
    };

    const nextCardStyle = {
      transform: [
        {
          scale: pan.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1.0, 0.8, 1.0],
            extrapolate: "clamp",
          }),
        },
      ],
      zIndex: 0,
    };

    return (
      <>
        <Animated.View
          key={currentData[currentIndex].id}
          style={[styles.cardContainer, currentCardStyle]}
          {...panResponder.panHandlers}
        >
          <Card {...currentData[currentIndex]} />
        </Animated.View>

        {currentIndex + 1 < currentData.length && (
          <Animated.View
            key={currentData[currentIndex + 1].id}
            style={[styles.cardContainer, nextCardStyle]}
          >
            <Card {...currentData[currentIndex + 1]} />
          </Animated.View>
        )}
      </>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {currentIndex < currentData.length && currentData.length > 0 ? (
        renderCards()
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
