package com.grile.licenta.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grile.licenta.model.Question;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
public class AiExplanationService {

    @Value("${anthropic.api.key:}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String explain(Question question, List<String> selectedAnswers) {
        if (apiKey == null || apiKey.isEmpty()) {
            return buildBasicExplanation(question, selectedAnswers);
        }
        return callClaudeApi(question, selectedAnswers);
    }

    public boolean isAiEnabled() {
        return apiKey != null && !apiKey.isEmpty();
    }

    private String callClaudeApi(Question question, List<String> selectedAnswers) {
        try {
            String prompt = buildPrompt(question, selectedAnswers);

            String requestBody = objectMapper.writeValueAsString(new java.util.LinkedHashMap<>() {{
                put("model", "claude-sonnet-4-20250514");
                put("max_tokens", 1024);
                put("messages", List.of(new java.util.LinkedHashMap<>() {{
                    put("role", "user");
                    put("content", prompt);
                }}));
            }});

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.anthropic.com/v1/messages"))
                    .header("Content-Type", "application/json")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode content = root.get("content");
                if (content != null && content.isArray() && !content.isEmpty()) {
                    return content.get(0).get("text").asText();
                }
            }

            return buildBasicExplanation(question, selectedAnswers)
                    + "\n\n(Eroare API: " + response.statusCode() + ")";

        } catch (Exception e) {
            return buildBasicExplanation(question, selectedAnswers)
                    + "\n\n(Eroare conexiune AI: " + e.getMessage() + ")";
        }
    }

    private String buildPrompt(Question question, List<String> selectedAnswers) {
        StringBuilder sb = new StringBuilder();
        sb.append("Ești un profesor universitar expert în informatică. ");
        sb.append("Explică în limba română, clar și concis, de ce răspunsul corect la următoarea întrebare de examen este cel indicat.\n\n");
        sb.append("Tematica: ").append(question.getTematica()).append("\n\n");
        sb.append("Întrebarea: ").append(question.getQuestionText()).append("\n\n");
        sb.append("Variantele:\n");
        for (String opt : question.getOptions()) {
            sb.append(opt).append("\n");
        }
        sb.append("\nRăspunsul/răspunsurile corecte: ");
        sb.append(String.join(", ", question.getCorrectAnswers().stream()
                .map(a -> "(" + a + ")").toList()));
        sb.append("\n\nStudentul a ales: ");
        sb.append(String.join(", ", selectedAnswers.stream()
                .map(a -> "(" + a + ")").toList()));
        sb.append("\n\nExplică:\n");
        sb.append("1. De ce răspunsul/răspunsurile corecte sunt corecte\n");
        sb.append("2. De ce celelalte variante sunt greșite\n");
        sb.append("3. Dacă studentul a greșit, explică de ce alegerea lui este incorectă\n");
        sb.append("\nFii concis dar riguros. Folosește exemple dacă ajută la înțelegere.");
        return sb.toString();
    }

    private String buildBasicExplanation(Question question, List<String> selectedAnswers) {
        List<String> correct = question.getCorrectAnswers();
        boolean isCorrect = correct.size() == selectedAnswers.size()
                && correct.containsAll(selectedAnswers);

        StringBuilder sb = new StringBuilder();
        if (isCorrect) {
            sb.append("✅ Corect! ");
        } else {
            sb.append("❌ Incorect. ");
        }
        sb.append("Răspunsul corect este: ");
        sb.append(String.join(", ", correct.stream().map(a -> "(" + a + ")").toList()));
        sb.append(".\n\nPentru o explicație detaliată generată de AI, ");
        sb.append("adaugă cheia ta Anthropic API în application.properties.");
        return sb.toString();
    }
}
