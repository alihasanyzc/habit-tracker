import { HStack, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  border,
  containerShape,
  font,
  foregroundStyle,
  frame,
  glassEffect,
  lineLimit,
  opacity,
  padding,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetFamily } from 'expo-widgets';
import type { GlassHabitWidgetProps, CompletionState } from './glassHabitWidget.types';

const DEFAULT_PROPS: GlassHabitWidgetProps = {
  habitName: 'Habit',
  habitEmoji: '✨',
  accentColor: '#FF7A14',
  weekdayLabels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
  weekdayActiveIndex: 0,
  weeklyCompletionStates: ['inactive', 'inactive', 'inactive', 'inactive', 'inactive', 'inactive', 'inactive'],
  weekLabel: 'Bu Hafta',
  doneCount: 0,
  totalCount: 0,
  streakCount: 0,
};

const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = 'rgba(255,255,255,0.65)';
const GLASS_BORDER = 'rgba(255,255,255,0.18)';

function CompletionCircle({
  state,
  label,
  isActive,
  accentColor,
}: {
  state: CompletionState;
  label: string;
  isActive: boolean;
  accentColor: string;
}) {
  // Duruma göre renk ve opacity belirleme
  const isDone = state === 'done';
  const isMissed = state === 'missed';

  return (
    <VStack
      alignment="center"
      spacing={4}
      modifiers={[frame({ width: 38 })]}>
      <Text
        modifiers={[
          font({ size: 10, weight: 'bold', design: 'rounded' }),
          foregroundStyle(isActive ? TEXT_PRIMARY : TEXT_SECONDARY),
          opacity(isActive ? 1 : 0.6)
        ]}>
        {label}
      </Text>

      <ZStack modifiers={[frame({ width: 30, height: 30 })]}>
        {/* Arka plan halkası */}
        <VStack
          modifiers={[
            frame({ width: 30, height: 30 }),
            glassEffect({
              glass: { variant: 'ultraThinMaterial' },
              shape: 'circle',
            }),
            border({ color: isActive ? 'rgba(255,255,255,0.4)' : GLASS_BORDER, width: 1 }),
          ]}
        />

        {/* Durum göstergesi */}
        {isDone && (
          <VStack
            modifiers={[
              frame({ width: 22, height: 22 }),
              glassEffect({
                glass: { variant: 'thinMaterial', tint: accentColor },
                shape: 'circle',
              }),
            ]}
          />
        )}

        {isMissed && !isActive && (
          <VStack
            modifiers={[
              frame({ width: 8, height: 8 }),
              glassEffect({
                glass: { variant: 'thinMaterial', tint: '#FF453A' },
                shape: 'circle',
              }),
            ]}
          />
        )}

        {isActive && !isDone && (
          <VStack
            modifiers={[
              frame({ width: 12, height: 12 }),
              border({ color: 'rgba(255,255,255,0.6)', width: 2 }),
              containerShape(shapes.circle()),
            ]}
          />
        )}
      </ZStack>
    </VStack>
  );
}

function GlassHabitWidgetLayout(
  props: Partial<GlassHabitWidgetProps>,
  environment: { widgetFamily: WidgetFamily }
) {
  'widget';

  const safeProps: GlassHabitWidgetProps = {
    ...DEFAULT_PROPS,
    ...props,
  };

  const isMedium = environment.widgetFamily === 'systemMedium';

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[
        frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'topLeading' }),
        padding({ all: 0 }),
        glassEffect({ glass: { variant: 'systemThinMaterial' } }),
      ]}>

      <VStack
        alignment="leading"
        spacing={14}
        modifiers={[
          frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'topLeading' }),
          padding({ all: 16 }),
        ]}>

        {/* Header: Icon + Name + Streak */}
        <HStack spacing={12} alignment="center">
          <ZStack modifiers={[frame({ width: 42, height: 42 })]}>
            <VStack
              modifiers={[
                frame({ width: 42, height: 42 }),
                glassEffect({
                  glass: { variant: 'regularMaterial', tint: safeProps.accentColor },
                  shape: 'roundedRectangle',
                  cornerRadius: 12,
                }),
                border({ color: 'rgba(255,255,255,0.2)', width: 0.5 })
              ]}
            />
            <Text modifiers={[font({ size: 22 })]}>{safeProps.habitEmoji}</Text>
          </ZStack>

          <VStack alignment="leading" spacing={0}>
            <Text
              modifiers={[
                font({ size: 18, weight: 'bold', design: 'rounded' }),
                foregroundStyle(TEXT_PRIMARY),
                lineLimit(1),
              ]}>
              {safeProps.habitName}
            </Text>
            <Text
              modifiers={[
                font({ size: 12, weight: 'medium', design: 'rounded' }),
                foregroundStyle(TEXT_SECONDARY),
              ]}>
              {safeProps.streakCount} günlük seri 🔥
            </Text>
          </VStack>

          <Spacer />

          <VStack alignment="trailing" spacing={0}>
            <Text
              modifiers={[
                font({ size: 18, weight: 'bold', design: 'rounded' }),
                foregroundStyle(safeProps.accentColor),
              ]}>
              %{Math.round((safeProps.doneCount / (safeProps.totalCount || 1)) * 100)}
            </Text>
            <Text
              modifiers={[
                font({ size: 10, weight: 'bold', design: 'rounded' }),
                foregroundStyle(TEXT_SECONDARY),
              ]}>
              TAMAMLANDI
            </Text>
          </VStack>
        </HStack>

        <Spacer />

        {/* Weekly Progress Strip */}
        <VStack spacing={10} alignment="leading">
          <HStack spacing={6} modifiers={[frame({ maxWidth: Infinity, alignment: 'center' })]}>
            {safeProps.weekdayLabels.map((label, index) => (
              <CompletionCircle
                key={`${label}-${index}`}
                label={label}
                state={safeProps.weeklyCompletionStates[index]}
                isActive={index === safeProps.weekdayActiveIndex}
                accentColor={safeProps.accentColor}
              />
            ))}
          </HStack>
        </VStack>

        <Spacer />

        {/* Footer: Week Label + Fractional Stats */}
        <HStack>
          <Text
            modifiers={[
              font({ size: 12, weight: 'semibold', design: 'rounded' }),
              foregroundStyle(TEXT_SECONDARY),
            ]}>
            {safeProps.weekLabel}
          </Text>
          <Spacer />
          <Text
            modifiers={[
              font({ size: 12, weight: 'bold', design: 'rounded' }),
              foregroundStyle(TEXT_PRIMARY),
            ]}>
            {safeProps.doneCount}/{safeProps.totalCount} gün
          </Text>
        </HStack>
      </VStack>
    </VStack>
  );
}

export const glassHabitWidget = createWidget<GlassHabitWidgetProps>(
  'GlassHabitWidget',
  GlassHabitWidgetLayout as any
);
