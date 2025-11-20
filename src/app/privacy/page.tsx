import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flower2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
              <Flower2 className="h-6 w-6 text-primary" />
              <span className="font-headline">StudioZen</span>
            </Link>
        </div>
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla Home
          </Link>
        </Button>
      </header>
      <main className="container mx-auto max-w-4xl py-8 px-4 md:py-12 md:px-6">
        <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
          <h1>Informativa sulla Privacy per StudioZen</h1>
          <p>
            <strong>Ultimo aggiornamento:</strong> {new Date().toLocaleDateString('it-IT')}
          </p>

          <h2>1. Introduzione</h2>
          <p>
            Benvenuto in StudioZen. La tua privacy è importante per noi. Questa Informativa sulla Privacy spiega quali dati personali raccogliamo, come li utilizziamo e quali sono i tuoi diritti in merito.
          </p>

          <h2>2. Dati che Raccogliamo</h2>
          <p>
            Raccogliamo le seguenti informazioni per fornire e migliorare il nostro servizio:
          </p>
          <ul>
            <li>
              <strong>Informazioni sull'account:</strong> Quando ti registri, raccogliamo il tuo nome, indirizzo email e password (crittografata). Se accedi con Google, riceviamo le informazioni del tuo profilo pubblico (nome, email, immagine del profilo).
            </li>
            <li>
              <strong>Dati di utilizzo:</strong> Raccogliamo informazioni su come utilizzi la nostra applicazione, come le sessioni di studio, i materiali riassunti e i siti bloccati. Questi dati sono associati al tuo account per fornirti le funzionalità dell'app.
            </li>
            <li>
              <strong>Cookie:</strong> Utilizziamo i cookie per gestire la sessione di autenticazione e per ricordare le tue preferenze, come l'accettazione del banner dei cookie.
            </li>
          </ul>

          <h2>3. Come Utilizziamo i Tuoi Dati</h2>
          <p>
            Utilizziamo i tuoi dati per:
          </p>
          <ul>
            <li>Fornire, mantenere e migliorare l'applicazione StudioZen.</li>
            <li>Autenticare gli utenti e proteggere gli account.</li>
            <li>Personalizzare la tua esperienza.</li>
            <li>Comunicare con te per questioni relative al servizio.</li>
          </ul>

          <h2>4. Condivisione dei Dati</h2>
          <p>
            Non condividiamo le tue informazioni personali con terze parti, ad eccezione dei fornitori di servizi essenziali (come Firebase di Google per l'hosting e l'autenticazione) che sono vincolati da obblighi di riservatezza.
          </p>
          
          <h2>5. Sicurezza dei Dati</h2>
          <p>
            Adottiamo misure di sicurezza ragionevoli per proteggere i tuoi dati da accessi non autorizzati, alterazioni o distruzione.
          </p>

          <h2>6. I Tuoi Diritti</h2>
          <p>
            Hai il diritto di accedere, correggere o eliminare i tuoi dati personali. Puoi gestire le informazioni del tuo account direttamente dall'applicazione o contattandoci.
          </p>

          <h2>7. Modifiche a questa Informativa</h2>
          <p>
            Potremmo aggiornare questa Informativa sulla Privacy di tanto in tanto. Ti informeremo di eventuali modifiche pubblicando la nuova informativa su questa pagina.
          </p>

          <h2>8. Contatti</h2>
          <p>
            Se hai domande su questa Informativa sulla Privacy, non esitare a contattarci.
          </p>
        </div>
      </main>
    </div>
  );
}
