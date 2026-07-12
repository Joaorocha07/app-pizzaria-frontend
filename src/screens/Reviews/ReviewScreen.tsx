import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { marketingService } from '../../services/marketingService';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Review'>;
  route: RouteProp<AppStackParamList, 'Review'>;
};

const LABELS = ['', 'Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente'];

export function ReviewScreen({ navigation, route }: Props) {
  const { orderId, productId } = route.params;
  const { colors } = useTheme();
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await marketingService.createReview({
        pedidoId: orderId,
        produtoId: productId,
        nota,
        comentario: comentario || undefined,
      });
      Alert.alert('Obrigado!', 'Sua avaliação foi enviada.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Avaliar pedido" onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1 px-4">
        <View className="items-center py-6">
          <Text className="text-offwhite font-bold text-base mb-4">Como foi sua experiência?</Text>
          <View className="flex-row gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setNota(n)}
                className="p-2"
                activeOpacity={0.7}
              >
                <Ionicons
                  name={nota >= n ? 'star' : 'star-outline'}
                  size={40}
                  color={nota >= n ? colors.accent : colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-accent font-bold text-lg">{LABELS[nota]}</Text>
        </View>

        <Text className="text-offwhite font-bold text-base mb-2">Comentário (opcional)</Text>
        <TextInput
          className="bg-dark-card border border-dark-border rounded-md px-4 py-3 text-offwhite text-sm"
          style={{ height: 100 }}
          placeholder="Conte como foi a experiência..."
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          value={comentario}
          onChangeText={setComentario}
        />
        <Button
          title="Enviar avaliação"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          className="mt-6 mb-8"
        />
      </ScrollView>
    </View>
  );
}
