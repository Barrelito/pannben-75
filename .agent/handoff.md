# LifeGrit Project Handoff

## Projektet

Vi bygger **LifeGrit** - en mjukare, mer hälsosam systersajt till **Pannben75** (75 Hard-utmaning). 

**Vision:** Företag/Gym kan skapa utmaningar för sina anställda/medlemmar via leverantörskoder.

---

## Vad som är byggt

### Dual-Site Arkitektur ✅
- Samma kodbas, två domäner: `pannben75.se` och `lifegrit.se`
- Hostname-baserad routing via middleware
- `SiteProvider` context för villkorlig rendering

### LifeGrit Landing Page ✅
- Grönt/guld designtema
- "Ange leverantörskod"-fält
- Separat från Pannben-design

### Vercel-konfiguration ✅
- Båda domänerna pekar på samma deployment

---

## Nyckelfiler

| Fil | Syfte |
|-----|-------|
| `lib/site-utils.ts` | Server-side hostname-detection |
| `lib/site-context.tsx` | Client-side `useSite()` hook |
| `app/lifegrit-globals.css` | LifeGrit CSS-variabler och klasser |
| `components/landing/LifeGritLanding.tsx` | LifeGrit landing page |
| `components/landing/PannbenLanding.tsx` | Pannben landing page |
| `app/page.tsx` | Root page - väljer landing baserat på hostname |

---

## Vad som återstår

### Fas 3: Auth & User Flow
- [ ] Login-sida med LifeGrit-design
- [ ] Join-flöde (verifiera leverantörskod)
- [ ] Dashboard med LifeGrit-design

### Fas 4: Provider Portal
- [ ] Databas-schema: `providers`, `challenges`, `challenge_participants`
- [ ] Admin-routes för leverantörer
- [ ] Skapa utmaning UI
- [ ] Deltagarstatistik

---

## Hur du promptar mig imorgon

Kopiera detta till chatten:

```
Läs handoff-dokumentet i projektet:
c:\Users\chris\Documents\KOD\pannben-75\.agent\handoff.md

Vi arbetade på LifeGrit-integrationen igår. Fortsätt med [login-sidan / join-flödet / provider-databasen].
```
