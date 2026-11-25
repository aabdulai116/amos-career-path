# Turning on accounts

The app works with none of this. Signed out, everything lives in the browser's
local storage and no account is needed — that is the mode someone gets when
they open a shared link, and it is deliberate. What follows adds sign-in and
sync on top.

Four steps, roughly half an hour. Three of them need you, because they involve
accounts and secrets.

---

## 1. A database

[Neon](https://console.neon.tech) — free tier, no card.

1. Create a project. Any region near you.
2. Copy the **pooled** connection string (it has `-pooler` in the host).
3. Put it in `.env.local` as `DATABASE_URL`.

Then create the tables:

```bash
npx drizzle-kit migrate
```

The migration in `drizzle/` is committed, so this applies exactly what the
tests ran against — no schema drift between your database and CI.

---

## 2. A secret for Auth.js

```bash
openssl rand -base64 32
```

Put it in `.env.local` as `AUTH_SECRET`. It signs session cookies, so treat it
like a password and use a different one in production.

---

## 3. Google sign-in

[console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

1. Create a project if you have none.
2. **OAuth consent screen** → External → fill in the app name and your email.
   While it is in "Testing" only accounts you list can sign in, which is
   useful while you are trying it. Publish it when you want to share it.
3. **Credentials** → Create credentials → OAuth client ID → Web application.
4. Authorised redirect URIs — add both:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR-DOMAIN/api/auth/callback/google`
5. Copy the client ID and secret into `AUTH_GOOGLE_ID` and
   `AUTH_GOOGLE_SECRET`.

---

## 4. Microsoft / Outlook sign-in

[entra.microsoft.com](https://entra.microsoft.com) → App registrations → New
registration.

1. **Supported account types**: choose *Accounts in any organizational
   directory and personal Microsoft accounts*. This is the setting that
   matters — anything narrower locks it to one university and shuts out
   personal Outlook addresses.
2. **Redirect URI**: Web →
   `https://YOUR-DOMAIN/api/auth/callback/microsoft-entra-id`
   (add the localhost one too while developing).
3. **Certificates & secrets** → New client secret → copy the *Value*, not the
   Secret ID. It is shown once.
4. Put them in `AUTH_MICROSOFT_ENTRA_ID_ID` and
   `AUTH_MICROSOFT_ENTRA_ID_SECRET`.

---

## 5. Deploy

```bash
npx vercel
```

Then add every variable from `.env.example` in the Vercel dashboard under
Settings → Environment Variables. Set `AUTH_URL` to the real domain. Redeploy.

Visit `/account`. If a provider's variables are missing, its button simply does
not appear, so you can turn them on one at a time.

---

## How sync behaves

- Local storage stays the source of truth while you work. Nothing waits on the
  network.
- Changes are pushed a few seconds after you stop making them, and immediately
  when you press **Sync now**.
- The server merges rather than overwrites: per record, the later edit wins.
  Work done on a laptop and a phone both survive.
- Signing in for the first time sends whatever the browser already has, so
  progress made before you had an account is kept.
- There are no tombstones. If you clear a problem on one device and another
  device has not synced since, it can come back. Adding deletion records would
  fix it and is not worth the complexity yet.

## What is stored, and what is not

Stored: your name, email and avatar from the provider, and your progress.

Not stored: any password — there is none to store. No access tokens are used
for anything beyond sign-in.

`/account` has a delete button that removes the account and every row attached
to it, by cascade. If you are going to ask other people to sign in, that button
is not optional.
