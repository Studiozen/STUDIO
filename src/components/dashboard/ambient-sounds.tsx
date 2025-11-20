'use client';

import { useState, useRef, useEffect, type FC } from 'react';
import * as Tone from 'tone';
import { Waves, Wind, Leaf } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SoundType = 'ocean' | 'wind' | 'forest';

const soundOptions: {
  type: SoundType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: 'ocean', label: 'Onde Rilassanti', icon: Waves },
  { type: 'wind', label: 'Vento Leggero', icon: Wind },
  { type: 'forest', label: 'Suoni della Foresta', icon: Leaf },
];

const AmbientSounds: FC = () => {
  const [playingSound, setPlayingSound] = useState<SoundType | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  useEffect(() => {
    return () => {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current.dispose();
      }
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
      }
    };
  }, []);

  const playSound = (soundType: SoundType) => {
    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current.dispose();
    }
    if (synthRef.current) {
      synthRef.current.dispose();
    }

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.5, sustain: 0.3, release: 1 },
    }).toDestination();
    synth.volume.value = -12;
    synthRef.current = synth;

    let notes: string[] = [];
    let interval = '';

    if (soundType === 'ocean') {
      notes = ['C4', 'E4', 'G4', 'B4'];
      interval = '2m';
    } else if (soundType === 'wind') {
      notes = ['A3', 'C4', 'E4', 'G4'];
      interval = '4n';
    } else if (soundType === 'forest') {
      notes = ['F3', 'A3', 'C4', 'E4'];
      interval = '3m';
    }

    const loop = new Tone.Loop(time => {
      const note = notes[Math.floor(Math.random() * notes.length)];
      synth.triggerAttackRelease(note, '8n', time);
    }, interval).start(0);

    loopRef.current = loop;
    Tone.Transport.start();
  };

  const toggleSound = async (soundType: SoundType) => {
    await Tone.start();
    if (playingSound === soundType) {
      if (loopRef.current) {
        loopRef.current.stop();
      }
      if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
      }
      setPlayingSound(null);
    } else {
      playSound(soundType);
      setPlayingSound(soundType);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5" />
          Suoni Rilassanti
        </CardTitle>
        <CardDescription>
          Scegli una musica di sottofondo per aiutarti a concentrarti.
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
