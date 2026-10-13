# 🐾 ASTRO - Adoção & Clínicas

> Pronto para entrar na órbita do Astro?

O **ASTRO** é uma plataforma 100% gratuita que transforma o cuidado animal, aproximando quem ama, quem resgata e quem cuida.

Conecta **tutores, ONGs e clínicas veterinárias** em um só lugar.

---

### ✨ Funcionalidades

- **É uma ONG?** Cadastre seus bichinhos na nossa vitrine e amplie seu alcance de adoções.
- **É um tutor?** Encontre seu novo amigo e cuide da saúde dele com descontos e praticidade.
- **É uma clínica?** Conecte-se a tutores da sua região e mostre seu trabalho na comunidade.

### 🚀 Tecnologias

- **Next.js 16** + **React 19**
- **TypeScript**
- **CSS Modules** + **Tailwind CSS**
- **Supabase** (login, cadastro e upload de fotos)
- **SweetAlert2** (alertas)

### 🪐 Arquitetura

```
[Front Next.js] ──login / cadastro / fotos──► Supabase (Auth + Storage)
      │
      └── token do login ──► [Back-end Java] ──► banco (Supabase)
```

O front usa o Supabase só para autenticação e upload de arquivos. Os dados da aplicação (perfil da conta, ONGs e pets) passam pelo back-end Java, que fica no repositório **Astro-Back-end**.

### 🔑 Variáveis de ambiente

Copie o `.env.example` para `.env` e preencha:

| Variável | Para que serve |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública do Supabase (Project Settings > API) |
| `NEXT_PUBLIC_API_URL` | URL do back-end Java (local: `http://localhost:8080`) |

> As variáveis `NEXT_PUBLIC_*` são embutidas no código durante o build. Ao mudar alguma delas na Vercel, é preciso fazer um novo deploy.

### 🛠️ Como rodar

O back-end precisa estar rodando (veja o README do **Astro-Back-end**).

```bash
# Clone o repositório
git clone https://github.com/M1GU3LT0X1C/ASTRO.git
cd ASTRO

# Configure as variáveis
cp .env.example .env

# Instale as dependências e rode
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### 🐳 Rodando com Docker

```bash
cp .env.example .env   # preencha os valores
docker compose up -d --build
```

O site sobe em [http://localhost:3000](http://localhost:3000). Para parar: `docker compose down`.

> Se for instalar pacotes novos, rode o `npm install` dentro de um container Linux. O npm no Windows remove dependências opcionais do Linux do `package-lock.json` e quebra o build do Docker.
