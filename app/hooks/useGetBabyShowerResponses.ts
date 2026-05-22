import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TYPY DANYCH
// ============================================================================

export interface BabyShowerResponse {
  id: string;
  event_id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  guessed_birth_date: string | null;      // YYYY-MM-DD
  guessed_hair_color: string | null;      // 'Blond', 'Brunetka', 'Rudawa', 'Czarna'
  guessed_height: number | null;          // cm
  guessed_name_length: number | null;     // liczba liter
  guessed_weight: number | null;          // kg
  guessed_eye_color: string | null;       // 'Niebieskie', 'Brązowe', 'Zielone', 'Szare'
  guessed_initials: string | null;        // 'AB'
  guessed_sibling: string | null;         // 'Tak' / 'Nie'
  created_at: string;
  updated_at: string;
}

export interface UseBabyShowerResponsesResult {
  responses: BabyShowerResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stats: {
    total: number;
    averageHeight: number | null;
    averageWeight: number | null;
    mostCommonHairColor: string | null;
    mostCommonEyeColor: string | null;
    hasChildrenPercentage: number;
  };
}

// ============================================================================
// HOOK: useGetBabyShowerResponses
// ============================================================================

export const useGetBabyShowerResponses = (eventId: string | null): UseBabyShowerResponsesResult => {
  const [responses, setResponses] = useState<BabyShowerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📥 Pobieranie odpowiedzi Baby Shower dla event_id:', eventId);

      const { data, error: supabaseError } = await supabase
        .from('baby_shower_responses')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setResponses(data || []);
      console.log('✅ Pobrano', (data || []).length, 'odpowiedzi');
    } catch (err: any) {
      console.error('❌ Błąd pobierania Baby Shower:', err);
      setError(err.message || 'Nie udało się pobrać danych');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();

    // REAL-TIME SUBSCRIPTION - nasłuchuj zmian w bazie
    if (!eventId) return;

    const subscription = supabase
      .channel(`baby_shower_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'baby_shower_responses',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('🔔 Zmiana w Baby Shower:', payload);
          fetchResponses(); // Odśwież dane
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId]);

  // ========================================================================
  // OBLICZANIE STATYSTYK
  // ========================================================================

  const calculateStats = () => {
    if (responses.length === 0) {
      return {
        total: 0,
        averageHeight: null,
        averageWeight: null,
        mostCommonHairColor: null,
        mostCommonEyeColor: null,
        hasChildrenPercentage: 0,
      };
    }

    // Średnia wysokość
    const heights = responses
      .filter((r) => r.guessed_height !== null)
      .map((r) => r.guessed_height as number);
    const averageHeight =
      heights.length > 0 ? heights.reduce((a, b) => a + b, 0) / heights.length : null;

    // Średnia waga
    const weights = responses
      .filter((r) => r.guessed_weight !== null)
      .map((r) => r.guessed_weight as number);
    const averageWeight =
      weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : null;

    // Najczęstszy kolor włosów
    const hairColorCount: { [key: string]: number } = {};
    responses.forEach((r) => {
      if (r.guessed_hair_color) {
        hairColorCount[r.guessed_hair_color] = (hairColorCount[r.guessed_hair_color] || 0) + 1;
      }
    });
    const mostCommonHairColor = Object.keys(hairColorCount).length
      ? Object.entries(hairColorCount).sort(([, a], [, b]) => b - a)[0][0]
      : null;

    // Najczęstszy kolor oczu
    const eyeColorCount: { [key: string]: number } = {};
    responses.forEach((r) => {
      if (r.guessed_eye_color) {
        eyeColorCount[r.guessed_eye_color] = (eyeColorCount[r.guessed_eye_color] || 0) + 1;
      }
    });
    const mostCommonEyeColor = Object.keys(eyeColorCount).length
      ? Object.entries(eyeColorCount).sort(([, a], [, b]) => b - a)[0][0]
      : null;

    // Procent zgadujących, że będzie rodzeństwo
    const withSiblingsCount = responses.filter(
      (r) => r.guessed_sibling?.toLowerCase() === 'tak'
    ).length;
    const hasChildrenPercentage = Math.round((withSiblingsCount / responses.length) * 100);

    return {
      total: responses.length,
      averageHeight: averageHeight ? Math.round(averageHeight * 10) / 10 : null,
      averageWeight: averageWeight ? Math.round(averageWeight * 10) / 10 : null,
      mostCommonHairColor,
      mostCommonEyeColor,
      hasChildrenPercentage,
    };
  };

  const stats = calculateStats();

  return {
    responses,
    loading,
    error,
    refetch: fetchResponses,
    stats,
  };
};

// ============================================================================
// HOOK: useSubscribeToBabyShower (opcjonalnie - do real-time updates)
// ============================================================================

export const useSubscribeToBabyShower = (eventId: string | null, onNewResponse?: (response: BabyShowerResponse) => void) => {
  useEffect(() => {
    if (!eventId) return;

    const subscription = supabase
      .channel(`baby_shower_realtime_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'baby_shower_responses',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('🎉 Nowa odpowiedź Baby Shower!', payload.new);
          if (onNewResponse && payload.new) {
            onNewResponse(payload.new as BabyShowerResponse);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, onNewResponse]);
};