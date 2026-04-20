import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, spacing } from "@/theme";
import { Button } from "@/components/ui/Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Slide {
  emoji: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    emoji: "🍽️",
    title: "Discover",
    subtitle: "Find the best restaurants near you",
  },
  {
    emoji: "🔍",
    title: "Browse",
    subtitle: "Explore cuisines and menus from top-rated restaurants",
  },
  {
    emoji: "🛵",
    title: "Order",
    subtitle: "Get your favorite food delivered to your doorstep",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
    }
  );

  const handleScrollIndex = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleScrollCombined = (event: any) => {
    handleScroll(event);
    handleScrollIndex(event);
  };

  const completeOnboarding = () => {
    // For now, just navigate - onboarding state can be stored later
    router.replace("/auth/login");
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const dotPositions = scrollX.interpolate({
    inputRange: SLIDES.map((_, i) => i * SCREEN_WIDTH),
    outputRange: SLIDES.map((_, i) => i),
    extrapolate: "clamp",
  });

  return (
    <View style={styles.wrapper} testID="screen-onboarding">
      {/* Purple gradient background */}
      <View style={styles.gradientBg}>
        <View style={styles.bgLayer1} />
        <View style={styles.purpleOrb1} />
        <View style={styles.purpleOrb2} />
        <View style={styles.cyanOrb} />
      </View>

      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Skip button */}
        <Animated.View style={[styles.skipContainer, { opacity: fadeAnim }]}>
          <Pressable onPress={handleSkip} style={styles.skipButton} testID="btn-skip">
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </Animated.View>

        {/* Slides */}
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScrollCombined}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {SLIDES.map((slide, index) => (
            <Animated.View
              key={index}
              style={[
                styles.slide,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Emoji illustration */}
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{slide.emoji}</Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>{slide.title}</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </Animated.View>
          ))}
        </Animated.ScrollView>

        {/* Dot indicators */}
        <Animated.View style={[styles.dotsContainer, { opacity: fadeAnim }]}>
          {SLIDES.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = dotPositions.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });

            const opacity = dotPositions.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                  },
                ]}
                testID={`dot-indicator-${index}`}
              />
            );
          })}
        </Animated.View>

        {/* CTA Button */}
        <Animated.View
          style={[
            styles.ctaContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View testID={isLastSlide ? "btn-get-started" : "btn-next"}>
            <Button
              title={isLastSlide ? "Get Started" : "Next"}
              onPress={handleNext}
              variant="gradient"
              size="lg"
              fullWidth
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
    backgroundColor: colors.background,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  bgLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0A14",
  },
  purpleOrb1: {
    position: "absolute",
    top: "-30%",
    right: "-25%",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(124, 58, 237, 0.3)",
  },
  purpleOrb2: {
    position: "absolute",
    top: "20%",
    left: "-20%",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
  },
  cyanOrb: {
    position: "absolute",
    bottom: "-10%",
    right: "-10%",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  container: {
    flex: 1,
  },
  skipContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 50,
    right: spacing.lg,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emojiContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  ctaContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? spacing.lg : spacing.xl,
  },
});
