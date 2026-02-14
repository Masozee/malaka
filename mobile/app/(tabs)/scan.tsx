import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  FlashIcon,
  FlashOffIcon,
  Search01Icon,
  ArrowLeft01Icon,
  Package01Icon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import type { StockItem } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.65;

const mockStockResult: StockItem = {
  id: '1',
  articleName: 'Nike Air Max 90',
  sku: 'NAM90-BLK-42',
  classification: 'Running Shoes',
  color: 'Black',
  colorHex: '#1A1A1A',
  warehouses: [
    { warehouseName: 'Main Warehouse', available: 45, reserved: 5, total: 50, isLow: false },
    { warehouseName: 'Outlet Store', available: 5, reserved: 2, total: 7, isLow: true },
    { warehouseName: 'Factory WH', available: 120, reserved: 10, total: 130, isLow: false },
  ],
};

export default function ScanScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<'scanner' | 'result' | 'manual'>('scanner');
  const [manualCode, setManualCode] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const [stockResult, setStockResult] = useState<StockItem | null>(null);

  const handleScan = () => {
    setStockResult(mockStockResult);
    setMode('result');
  };

  const handleManualSearch = () => {
    if (manualCode.trim()) {
      setStockResult(mockStockResult);
      setMode('result');
    }
  };

  if (mode === 'result' && stockResult) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.appBackground }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: Spacing.md,
          }}
        >
          <TouchableOpacity onPress={() => setMode('scanner')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ ...Typography.h3, color: colors.foreground, flex: 1 }}>
            Stock Lookup
          </Text>
        </View>

        <View style={{ padding: Spacing.lg, gap: Spacing.lg, flex: 1 }}>
          <Card padding="lg">
            <View style={{ gap: Spacing.sm }}>
              <HugeiconsIcon icon={Package01Icon} size={32} color={colors.secondaryText} />
              <Text style={{ ...Typography.h2, color: colors.foreground }}>
                {stockResult.articleName}
              </Text>
              <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
                <Badge label={stockResult.sku} variant="outline" size="sm" />
                <Badge label={stockResult.classification} variant="outline" size="sm" />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: stockResult.colorHex }} />
                  <Text style={{ ...Typography.caption, color: colors.secondaryText }}>{stockResult.color}</Text>
                </View>
              </View>
            </View>
          </Card>

          <Card padding="lg">
            <Text style={{ ...Typography.h3, color: colors.foreground, marginBottom: Spacing.md }}>
              Stock Balance
            </Text>
            <View style={{ flexDirection: 'row', paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ flex: 2, ...Typography.overline, color: colors.tertiaryText }}>Warehouse</Text>
              <Text style={{ flex: 1, ...Typography.overline, color: colors.tertiaryText, textAlign: 'right' }}>Avail</Text>
              <Text style={{ flex: 1, ...Typography.overline, color: colors.tertiaryText, textAlign: 'right' }}>Rsv</Text>
              <Text style={{ flex: 1, ...Typography.overline, color: colors.tertiaryText, textAlign: 'right' }}>Total</Text>
            </View>
            {stockResult.warehouses.map((wh, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  paddingVertical: Spacing.sm,
                  ...(idx < stockResult.warehouses.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                  }),
                }}
              >
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ ...Typography.body, color: colors.foreground }}>{wh.warehouseName}</Text>
                  {wh.isLow && <Badge label="Low" variant="warning" size="sm" />}
                </View>
                <Text style={{ flex: 1, ...Typography.mono, color: colors.foreground, textAlign: 'right' }}>{wh.available}</Text>
                <Text style={{ flex: 1, ...Typography.mono, color: colors.secondaryText, textAlign: 'right' }}>{wh.reserved}</Text>
                <Text style={{ flex: 1, ...Typography.mono, fontFamily: 'JetBrainsMono_700Bold', color: colors.foreground, textAlign: 'right' }}>{wh.total}</Text>
              </View>
            ))}
          </Card>

          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button title="Receive Stock" onPress={() => {}} variant="outline" fullWidth />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Adjust Stock" onPress={() => {}} variant="outline" fullWidth />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
          <TouchableOpacity onPress={() => router.back()}>
            <HugeiconsIcon icon={Cancel01Icon} size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ ...Typography.h3, color: '#FFFFFF' }}>Scan Barcode</Text>
          <TouchableOpacity onPress={() => setFlashOn(!flashOn)}>
            <HugeiconsIcon icon={flashOn ? FlashOffIcon : FlashIcon} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE, borderWidth: 2, borderColor: colors.primary, borderRadius: BorderRadius.lg, position: 'relative' }}>
            {[{ top: -2, left: -2 }, { top: -2, right: -2 }, { bottom: -2, left: -2 }, { bottom: -2, right: -2 }].map((pos, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute', ...pos, width: 30, height: 30,
                  borderColor: colors.primary, borderWidth: 3,
                  ...(i < 2 ? { borderBottomWidth: 0 } : { borderTopWidth: 0 }),
                  ...(i % 2 === 0 ? { borderRightWidth: 0 } : { borderLeftWidth: 0 }),
                  borderRadius: 4,
                }}
              />
            ))}
            <Text style={{ ...Typography.caption, color: '#FFFFFF', textAlign: 'center', marginTop: SCAN_AREA_SIZE / 2 - 10 }}>
              Position barcode within frame
            </Text>
          </View>
          <TouchableOpacity onPress={handleScan} style={{ marginTop: Spacing.xxl, backgroundColor: colors.primary, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: BorderRadius.full }}>
            <Text style={{ ...Typography.bodyMedium, color: '#FFFFFF' }}>Simulate Scan</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md }}>
          <TouchableOpacity onPress={() => setMode('manual')} style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center' }}>
            <Text style={{ ...Typography.bodyMedium, color: '#FFFFFF' }}>Enter Code Manually</Text>
          </TouchableOpacity>
          {mode === 'manual' && (
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <TextInput
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="Enter barcode or SKU"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, color: '#FFFFFF', ...Typography.body }}
                autoFocus
              />
              <TouchableOpacity onPress={handleManualSearch} style={{ backgroundColor: colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, justifyContent: 'center' }}>
                <HugeiconsIcon icon={Search01Icon} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
