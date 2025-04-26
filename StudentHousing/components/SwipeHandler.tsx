import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  PanResponder,
  Animated,
  Dimensions,
  Text,
} from "react-native";

interface Props<T extends Record<string, unknown> & { id: string | number }> {
  Card: React.ComponentType<T>;
  data: T[];
  onSwipeRight: (data: { index: number; data: T }) => void;
  onSwipeLeft: (data: { index: number; data: T }) => void;
  requestUpdate: () => void;
  style?: object;
}

export default function SwipeHandler<
  T extends Record<string, unknown> & { id: string | number }
>({ Card, data, onSwipeRight, onSwipeLeft, requestUpdate, style }: Props<T>) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [curIndex, setCurIndex] = useState(0);
  const isSwipingRef = useRef(false);
  const [currentData, setCurrentData] = useState(data);
  const SCREEN_WIDTH = Dimensions.get("window").width;

  // Store the actual index in a ref to prevent closure issues
  const indexRef = useRef(0);

  useEffect(() => {
    setCurrentData(data);
    indexRef.current = 0;
    setCurIndex(0);
  }, [data]);

  useEffect(() => {
    // Call requestUpdate if we've gone past the end of the array
    if (curIndex >= currentData.length) {
      requestUpdate();
    }
  }, [curIndex, currentData, requestUpdate]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isSwipingRef.current,

      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (isSwipingRef.current) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },

      onPanResponderGrant: () => {
        // Mark that we're starting a swipe
        isSwipingRef.current = true;
      },

      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),

      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const swipeThreshold = SCREEN_WIDTH / 3;

        if (Math.abs(dx) > swipeThreshold) {
          // Block additional swipes during animation
          isSwipingRef.current = true;

          Animated.timing(pan, {
            toValue: { x: dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, y: dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            // Create a local copy of the current index to use in callbacks
            const currentIdx = indexRef.current;

            let action = onSwipeLeft;
            if (dx > 0) {
              action = onSwipeRight;
            }

            // Prepare the data object to pass to the handler
            const dataToPass = {
              index: currentIdx,
              data: currentData[currentIdx],
            };

            // Update the index ref first
            indexRef.current = currentIdx + 1;

            // Reset animation before state updates
            pan.setValue({ x: 0, y: 0 });

            // Execute the handler
            action(dataToPass);

            // Now update the state with the new index
            // Use setTimeout to push this to the next event cycle
            setTimeout(() => {
              setCurIndex(indexRef.current);
              // Allow swiping again
              isSwipingRef.current = false;
            }, 0);
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start(() => {
            // Allow swiping again after spring-back animation
            isSwipingRef.current = false;
          });
        }
      },

      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  const renderCard = (index: number) => {
    if (!currentData[index]) return null;

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
          key={currentData[index].id}
          style={[styles.cardContainer, currentCardStyle]}
          {...panResponder.panHandlers}
        >
          <Card {...currentData[index]} />
        </Animated.View>

        {index + 1 < currentData.length && (
          <Animated.View
            key={currentData[index + 1].id}
            style={[styles.cardContainer, nextCardStyle]}
          >
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
    zIndex: 9999,
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
