# 📥 Guida all'Installazione di Git

## Passo 1: Download

Ho aperto automaticamente la pagina di download. Se non si è aperta, vai su:
**https://git-scm.com/download/win**

## Passo 2: Installazione

1. **Scarica Git** (dovrebbe scaricarsi automaticamente)
2. **Esegui il file scaricato** (es: `Git-2.x.x-64-bit.exe`)
3. **Segui l'installazione guidata**:
   - ✅ Clicca "Next" su tutte le schermate
   - ✅ **Mantieni le impostazioni predefinite** (sono perfette)
   - ✅ Assicurati che "Git from the command line and also from 3rd-party software" sia selezionato
   - ✅ Clicca "Install"
   - ✅ Attendi il completamento
   - ✅ Clicca "Finish"

## Passo 3: Verifica Installazione

Dopo l'installazione, **CHIUDI E RIAVVIA** il terminale/PowerShell, poi esegui:

```powershell
git --version
```

Dovresti vedere qualcosa come: `git version 2.x.x`

## Passo 4: Configurazione Git (Prima Volta)

Configura il tuo nome e email (sostituisci con i tuoi dati):

```powershell
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua.email@example.com"
```

**Esempio:**
```powershell
git config --global user.name "Francesco"
git config --global user.email "francesco@example.com"
```

## Passo 5: Esporta il Progetto

Dopo aver configurato Git, torna nella cartella del progetto ed esegui:

```powershell
cd C:\Users\franc\Documents\STUDIO-main
.\setup-github.bat
```

Oppure usa lo script PowerShell:

```powershell
.\setup-github.ps1
```

## ⚠️ Importante

- **Riavvia sempre il terminale** dopo l'installazione di Git
- Se Git non viene riconosciuto, riavvia anche il computer
- Usa Git Bash se PowerShell non funziona

## ✅ Verifica Rapida

Dopo l'installazione, verifica che tutto funzioni:

```powershell
git --version          # Mostra versione Git
git config --list      # Mostra configurazione
```

## 🆘 Problemi?

### Git non viene riconosciuto dopo installazione
1. Chiudi TUTTI i terminali aperti
2. Riapri un nuovo terminale
3. Se ancora non funziona, riavvia il computer

### Errore durante installazione
- Assicurati di avere i permessi di amministratore
- Disinstalla versioni vecchie di Git se presenti
- Scarica la versione più recente

### Non riesco a trovare Git dopo installazione
- Git si installa in: `C:\Program Files\Git\`
- Aggiungi manualmente al PATH se necessario

## 📞 Supporto

Se hai problemi, consulta:
- Documentazione Git: https://git-scm.com/doc
- Guida GitHub: https://docs.github.com

---

**Quando hai finito l'installazione, dimmi e procederemo con l'esportazione su GitHub!** 🚀
