import Header from '@/components/dashboard/header';
import FocusTimer from '@/components/dashboard/focus-timer';
import AmbientSounds from '@/components/dashboard/ambient-sounds';
import Summarizer from '@/components/dashboard/summarizer';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Summarizer />
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <FocusTimer />
            <AmbientSounds />
          </div>
        </div>
      </main>
    </div>
  );
}
