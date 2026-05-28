const TRIGGERS = [
  "erkläre",
  "erklare",
  "was ist",
  "wie",
  "warum",
  "zeige",
  "fasse zusammen",
  "erstelle",
  "liste auf",
  "definiere",
];

const SYSTEM_PROMPT_WITH_PDF = `Du bist ein präziser Lernassistent für Berufsschüler in der Schweiz.

Du hast Zugriff auf Seiten aus dem Lehrbuch des Nutzers.

Priorisierung:

1. Antworte zuerst basierend auf dem Lehrbuch

2. Wenn etwas nicht im Lehrbuch steht, ergänze mit deinem eigenen Wissen

3. Kennzeichne eigenes Wissen mit: "(aus eigenem Wissen)"

Regeln:

- Antworte IMMER auf Deutsch

- Maximal 150 Wörter

- Strukturiert und klar

- Keine Einleitung wie "Gerne beantworte ich..."

- Direkt zur Antwort

- Bei Formeln: schreibe sie klar aus z.B. U = R · I`;

const SYSTEM_PROMPT_NO_PDF = `Du bist ein präziser Lernassistent für Berufsschüler in der Schweiz.

Du hilfst bei der Vorbereitung auf die Abschlussprüfung.

Regeln:

- Antworte IMMER auf Deutsch

- Maximal 150 Wörter

- Strukturiert und klar

- Keine Einleitung wie "Gerne beantworte ich..."

- Direkt zur Antwort

- Bei Formeln: schreibe sie klar aus z.B. U = R · I

- Bei Aufzählungen: nutze Bulletpoints`;

export function isQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (t.endsWith("?")) return true;
  return TRIGGERS.some((trig) => t.startsWith(trig + " ") || t === trig);
}

export async function askLmStudio(question: string, images?: string[]): Promise<string> {
  const hasPdfLoaded = !!images && images.length > 0;
  const systemPrompt = hasPdfLoaded ? SYSTEM_PROMPT_WITH_PDF : SYSTEM_PROMPT_NO_PDF;

  const userContent: unknown = hasPdfLoaded
    ? [
        { type: "text", text: question },
        ...images!.map((url) => ({ type: "image_url", image_url: { url } })),
      ]
    : question;

  const response = await fetch("http://localhost:1234/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "local-model",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 400,
    }),
  });
  if (!response.ok) throw new Error(`LM Studio HTTP ${response.status}`);
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Invalid LM Studio response");
  return content.trim();
}

