'use client';

import { useState, useRef, useEffect, type FC } from 'react';
import * as Tone from 'tone';
import { Volume2, Music, Waves, Wind } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SoundType = 'brown' | 'pink' | 'white';

const soundOptions: {
  type: SoundType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: 'brown', label: 'Brown Noise', icon: Waves },
  { type: 'pink', label: 'Pink Noise', icon: Wind },
  { type: 'white', label: 'White Noise', icon: Volume2 },
];

const AmbientSounds: FC = () => {
  const [playingSound, setPlayingSound] = useState<SoundType | null>(null);
  const noiseRef = useRef<Tone.Noise | null>(null);

  useEffect(() => {
    return () => {
      if (noiseRef.current) {
        noiseRef.current.stop();
        noiseRef.current.dispose();
      }
      if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
      }
    };
  }, []);

  const toggleSound = async (soundType: SoundType) => {
    await Tone.start();
    if (playingSound === soundType) {
      if (noiseRef.current) {
        noiseRef.current.stop();
      }
      setPlayingSound(null);
    } else {
      if (noiseRef.current) {
        noiseRef.current.stop();
        noiseRef.current.dispose();
      }
      const newNoise = new Tone.Noise(soundType).toDestination();
      newNoise.volume.value = -12;
      newNoise.start();
      noiseRef.current = newNoise;
      setPlayingSound(soundType);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Ambient Sounds
        </CardTitle>
        <CardDescription>
          Use background sounds to help you focus.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {soundOptions.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant={playingSound === type ? 'default' : 'outline'}
              onClick={() => toggleSound(type)}
              className={cn("flex flex-col h-24 gap-2", playingSound === type && 'bg-primary text-primary-foreground')}
            >
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AmbientSounds;
