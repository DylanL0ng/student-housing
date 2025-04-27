import { useEffect, useRef, useState } from "react";
import { StyleSheet, GestureResponderEvent } from "react-native";
import { TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
const ImageCollection = ({
  styles,
  media,
}: {
  styles?: any;
  media: string[];
}) => {
  const [currentMedia, setCurrentMedia] = useState(0);
  const [touchableOpacityWidth, setTouchableOpacityWidth] = useState(0);

  useEffect(() => {
    setCurrentMedia(0);
  }, [media]);
  const cycleImages = (e: GestureResponderEvent) => {
    const { locationX } = e.nativeEvent;
    const isRightSide = locationX > touchableOpacityWidth / 2;

    let nextMedia = currentMedia;
    if (isRightSide) {
      nextMedia = (currentMedia + 1) % media.length;
    } else {
      nextMedia = (currentMedia - 1 + media.length) % media.length;
    }

    setCurrentMedia(nextMedia);
  };
  return (
    <TouchableOpacity
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        setTouchableOpacityWidth(width);
      }}
      activeOpacity={1.0}
      style={{ flex: 1 }}
      onPress={cycleImages}
    >
      <View style={_styles.indicatorGroup}>
        {media.map((_, index) => (
          <View
            style={[
              _styles.indicators,
              index === currentMedia ? _styles.active : null,
            ]}
            key={index}
          />
        ))}
      </View>
      <Image
        cachePolicy={"none"}
        transition={0}
        source={media[currentMedia]}
        style={{ ..._styles.float, borderRadius: 4, height: "80%" }}
      ></Image>
    </TouchableOpacity>
  );
};

const _styles = StyleSheet.create({
  indicatorGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    position: "absolute",
    margin: 8,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1,
    gap: 4,
  },
  indicators: {
    width: "100%",
    flexShrink: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  active: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  float: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ImageCollection;
