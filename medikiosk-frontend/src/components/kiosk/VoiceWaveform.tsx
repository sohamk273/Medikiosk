/**
 * VoiceWaveform — CSS-animated equalizer bars.
 *
 * Visual-only mock. No microphone access. No audio processing.
 * Heights are fixed and animated via CSS keyframes.
 */

// Bar heights in a natural-looking pattern
const BAR_HEIGHTS = [6, 12, 20, 14, 28, 18, 32, 22, 16, 30, 20, 12, 26, 18, 8];
const DELAYS = [0, 0.1, 0.2, 0.05, 0.3, 0.15, 0.25, 0.08, 0.35, 0.18, 0.28, 0.12, 0.22, 0.07, 0.38];

interface VoiceWaveformProps {
  active?: boolean;
  color?: string;
}

export function VoiceWaveform({ active = true, color = '#0D9488' }: VoiceWaveformProps) {
  if (!active) {
    // Static bars when not active (e.g. playback display)
    return (
      <div className="flex items-end gap-1 h-10">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full opacity-40"
            style={{ height: h * 0.6, backgroundColor: color }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1 h-10">
      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full"
          style={{
            height: h,
            backgroundColor: color,
            animation: `waveform-bar 0.8s ease-in-out ${DELAYS[i]}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
