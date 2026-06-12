import React, { useRef, useState, useEffect } from 'react';
import { View, Image, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Banner } from '../../types';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

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
    <View className="mb-6">
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPress?.(item)}
            activeOpacity={0.9}
            style={{ width: BANNER_WIDTH }}
            className="mx-4 rounded-2xl overflow-hidden"
          >
            <Image
              source={{ uri: item.urlImagem }}
              style={{ width: BANNER_WIDTH - 32, height: 160 }}
              resizeMode="cover"
              className="rounded-2xl"
            />
          </TouchableOpacity>
        )}
      />
      {banners.length > 1 && (
        <View className="flex-row justify-center mt-3 gap-1">
          {banners.map((_, i) => (
            <View
              key={i}
              className={`rounded-full ${
                i === activeIndex ? 'w-4 h-2 bg-primary' : 'w-2 h-2 bg-dark-border'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
