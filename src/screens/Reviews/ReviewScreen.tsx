import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { marketingService } from '../../services/marketingService';
import { Button } from '../../components/common/Button';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Review'>;
  route: RouteProp<AppStackParamList, 'Review'>;
};

export function ReviewScreen({ navigation, route }: Props) {
  const { orderId, productId } = route.params;
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await marketingService.createReview({ pedidoId: orderId, produtoId: productId, nota, comentario: comentario || undefined });
      Alert.alert('Obrigado!', 'Sua avaliação foi enviada.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-dark">
      <View className="px-4 pt-14 pb-4 flex-row items-center gap-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary font-bold text-base">←</Text>
        </TouchableOpacity>
        <Text className="text-offwhite text-xl font-bold">Avaliar</Text>
      </View>
      <ScrollView className="flex-1 px-4">
        <Text className="text-offwhite font-bold text-base mb-4">Sua nota</Text>
        <View className="flex-row gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setNota(n)} className="flex-1 items-center">
              <Text className={`text-3xl ${nota >= n ? '' : 'opacity-30'}`}>⭐</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-offwhite font-bold text-base mb-2">Comentário (opcional)</Text>
        <TextInput
          className="bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-offwhite text-sm h-24"
          placeholder="Conte como foi a experiência..."
          placeholderTextColor="#6B7280"
          multiline
          textAlignVertical="top"
          value={comentario}
          onChangeText={setComentario}
        />
        <Button title="Enviar avaliação" onPress={handleSubmit} loading={loading} size="lg" className="mt-6" />
      </ScrollView>
    </View>
  );
}
