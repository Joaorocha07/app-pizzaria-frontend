import React, { useRef, useState, useEffect } from 'react';
import { View, Image, FlatList, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { Banner } from '../../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_H = 170;
const ITEM_WIDTH = SCREEN_WIDTH - 40;
const ITEM_MARGIN = 8;

interface BannerCarouselProps {
  banners: Banner[];
  onPress?: (banner: Banner) => void;
}

export function BannerCarousel({ banners, onPress }: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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
    <View style={styles.wrapper}>
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
            {/* Sombra interna inferior */}
            <View style={styles.imageShadow} />
          </TouchableOpacity>
        )}
      />

      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
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
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    borderRadius: 4,
    height: 6,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#8B1A1A',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#2A2A2A',
  },
});
