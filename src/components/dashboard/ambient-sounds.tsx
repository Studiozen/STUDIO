'use client';

import { useState, useRef, useEffect, type FC } from 'react';
import * as Tone from 'tone';
import { Music, MoonStar, Bird } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SoundType = 'piano' | 'night' | 'nature';

interface PlayerRef {
    synth: any;
    loop: Tone.Loop;
    dispose: () => void;
}

const soundOptions: {
  type: SoundType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: 'piano', label: 'Piano Classico', icon: Music },
  { type: 'night', label: 'Notte Stellata', icon: MoonStar },
  { type: 'nature', label: 'Canto della Natura', icon: Bird },
];

const AmbientSounds: FC = () => {
  const [playingSound, setPlayingSound] = useState<SoundType | null>(null);
  const playerRef = useRef<PlayerRef | null>(null);

  // Effect to handle cleanup when the component unmounts
  useEffect(() => {
    // This is the cleanup function that will be called when the component is unmounted.
    return () => {
      stopAllSounds();
    };
  }, []);

  const stopAllSounds = () => {
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    }
    playerRef.current?.dispose();
    playerRef.current = null;
    setPlayingSound(null);
  }

  const playSound = (soundType: SoundType) => {
    stopAllSounds();

    let synth: any;
    let loop: Tone.Loop;
    let nodes: Tone.ToneAudioNode[] = [];

    if (soundType === 'piano') {
        synth = new Tone.FMSynth({
            harmonicity: 3.01,
            modulationIndex: 14,
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 1.2 },
            modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.1 }
        }).toDestination();
        const notes = ['C4', 'E4', 'G4', 'B4', 'D5', 'A4', 'F4'];
        loop = new Tone.Loop(time => {
            const note = notes[Math.floor(Math.random() * notes.length)];
            synth.triggerAttackRelease(note, '8n', time);
        }, '4n').start(0);

    } else if (soundType === 'night') {
        const reverb = new Tone.Reverb(2).toDestination();
        const chorus = new Tone.Chorus(2, 2.5, 0.7).connect(reverb);
        synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.8, decay: 1.5, sustain: 0.2, release: 2 },
        }).connect(chorus);
        synth.volume.value = -12;
        nodes.push(reverb, chorus);
        const notes = ['A3', 'C4', 'E4', 'G4', 'B4', 'D4'];
        loop = new Tone.Loop(time => {
            const note = notes[Math.floor(Math.random() * notes.length)];
            synth.triggerAttackRelease(note, '1n', time);
        }, '2n').start(0);

    } else if (soundType === 'nature') {
        const vibrato = new Tone.Vibrato(5, 0.2).toDestination();
        synth = new Tone.AMSynth({
            harmonicity: 1.5,
            envelope: { attack: 0.1, decay: 1, sustain: 0.3, release: 1.5 },
            modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
        }).connect(vibrato);
        nodes.push(vibrato);
        const notes = ['F#4', 'G#4', 'B4', 'C#5', 'D#5'];
        loop = new Tone.Loop(time => {
            const note = notes[Math.floor(Math.random() * notes.length)];
            synth.triggerAttackRelease(note, '4n', time);
        }, '3n').start(0);
    }
    
    playerRef.current = {
        synth,
        loop,
        dispose: () => {
            synth?.dispose();
            loop?.dispose();
            nodes.forEach(node => node.dispose());
        }
    };
    
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    }
    setPlayingSound(soundType);
  };

  const toggleSound = async (soundType: SoundType) => {
    // Tone.start() must be called in response to a user interaction
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    if (playingSound === soundType) {
      stopAllSounds();
    } else {
      playSound(soundType);
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Musica Rilassante
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
              className={cn("flex flex-col h-24 gap-2 justify-center text-center")}
            >
              <Icon className="h-6 w-6" />
              <span className="text-wrap">{label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AmbientSounds;
