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

export function isQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (t.endsWith("?")) return true;
  return TRIGGERS.some((trig) => t.startsWith(trig + " ") || t === trig);
}

export async function askLmStudio(question: string): Promise<string> {
  const response = await fetch("http://localhost:1234/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "local-model",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein präziser Lernassistent für Berufsschüler in der Schweiz. Antworte immer auf Deutsch, klar und strukturiert. Maximal 150 Wörter pro Antwort. Kein Smalltalk.",
        },
        { role: "user", content: question },
      ],
      temperature: 0.5,
      max_tokens: 300,
    }),
  });
  if (!response.ok) throw new Error(`LM Studio HTTP ${response.status}`);
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Invalid LM Studio response");
  return content.trim();
}
