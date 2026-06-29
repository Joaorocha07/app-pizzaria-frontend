import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Banner } from '../../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_H = 185;
const ITEM_WIDTH = SCREEN_WIDTH - 40;
const ITEM_MARGIN = 8;

interface BannerCarouselProps {
  banners: Banner[];
  onPress?: (banner: Banner) => void;
}

function AnimatedDot({ active }: { active: boolean }) {
  const width = useRef(new Animated.Value(active ? 24 : 6)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0.35)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(width, {
        toValue: active ? 24 : 6,
        useNativeDriver: false,
        speed: 18,
        bounciness: 5,
      }),
      Animated.timing(opacity, {
        toValue: active ? 1 : 0.35,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  }, [active]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width,
          opacity,
          backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.28)',
        },
      ]}
    />
  );
}

export function BannerCarousel({ banners, onPress }: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      const next = (activeIndex + 1) % banners.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, banners.length]);

  if (!banners.length) return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        snapToInterval={ITEM_WIDTH + ITEM_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (ITEM_WIDTH + ITEM_MARGIN * 2),
          );
          setActiveIndex(Math.max(0, Math.min(index, banners.length - 1)));
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPress?.(item)}
            activeOpacity={0.92}
            style={styles.item}
          >
            <Image
              source={{ uri: item.urlImagem }}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={styles.gradient}
            />
          </TouchableOpacity>
        )}
      />

      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <AnimatedDot key={i} active={i === activeIndex} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  item: {
    width: ITEM_WIDTH,
    height: BANNER_H,
    marginHorizontal: ITEM_MARGIN,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
