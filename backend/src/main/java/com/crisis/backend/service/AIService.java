package com.crisis.backend.service;

import com.crisis.backend.model.Analysis;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
public class AIService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public AIService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder
            .baseUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent")
            .build();
        this.objectMapper = objectMapper;
    }

    // ─── Filter important news ─────────────────────────────────────────────────
    public List<Map<String, Object>> filterImportantNews(List<Map<String, String>> articles) {
        if (articles == null || articles.isEmpty()) return new ArrayList<>();

        StringBuilder sb = new StringBuilder(
            "You are a senior economist and geopolitical analyst. Review these news articles " +
            "and pick the ones with the HIGHEST global economic or geopolitical impact.\n" +
            "Prioritize: wars, military conflicts, sanctions, financial crises, oil/energy shocks, " +
            "political instability, nuclear threats, and trade wars.\n\n"
        );
        for (int i = 0; i < articles.size(); i++) {
            sb.append("Index: ").append(i).append("\n")
              .append("Title: ").append(articles.get(i).get("title")).append("\n")
              .append("Description: ").append(articles.get(i).get("description")).append("\n\n");
        }
        sb.append("Return ONLY a raw JSON array (no markdown). Select up to 5 articles.\n")
          .append("Format: [{\"index\": 0, \"reason\": \"brief reason\"}]");

        return callGeminiForList(sb.toString(), 2);
    }

    // ─── Analyze a single article ──────────────────────────────────────────────
    public Analysis analyzeNews(String title, String content) {
        String prompt =
            "You are a senior economic analyst. Analyze this specific news article and provide " +
            "a UNIQUE, DETAILED analysis based only on what the headline and content describe.\n\n" +
            "Title: " + title + "\n" +
            "Content: " + content + "\n\n" +
            "Return ONLY raw JSON (no markdown backticks):\n" +
            "{\n" +
            "  \"countriesAffected\": [\"list of real country names mentioned or directly impacted\"],\n" +
            "  \"impact\": \"2-3 sentence specific economic impact based on THIS article\",\n" +
            "  \"shortTerm\": \"specific short-term consequences (1-6 months) from THIS event\",\n" +
            "  \"longTerm\": \"specific long-term consequences (1-3 years) from THIS event\",\n" +
            "  \"riskLevel\": \"High or Medium or Low\",\n" +
            "  \"suggestions\": [\"3 specific, actionable recommendations relevant to THIS event\"]\n" +
            "}";

        return callGeminiForAnalysis(title, prompt, 3);
    }

    // ─── Shared Gemini call with retry logic ────────────────────────────────────
    private List<Map<String, Object>> callGeminiForList(String prompt, int maxRetries) {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                Map response = postToGemini(prompt, 0.1);
                String json = extractText(response);
                if (json != null) {
                    return objectMapper.readValue(cleanJson(json), new TypeReference<List<Map<String, Object>>>() {});
                }
            } catch (WebClientResponseException.TooManyRequests e) {
                System.err.println("[Attempt " + attempt + "] Rate limited on filter, failing fast to fallback...");
                break;
            } catch (Exception e) {
                System.err.println("Filter news error: " + e.getMessage());
                break;
            }
        }
        return new ArrayList<>();
    }

    private Analysis callGeminiForAnalysis(String title, String prompt, int maxRetries) {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                Map response = postToGemini(prompt, 0.3);
                String json = extractText(response);
                if (json != null) {
                    Analysis a = objectMapper.readValue(cleanJson(json), Analysis.class);
                    a.setTitle(title);
                    return a;
                }
            } catch (WebClientResponseException.TooManyRequests e) {
                System.err.println("[Attempt " + attempt + "] Rate limited on analyze, failing fast to fallback...");
                break;
            } catch (Exception e) {
                System.err.println("Failed to analyze news via Gemini: " + e.getMessage());
                break;
            }
        }
        return null;
    }

    // ─── HTTP helper ───────────────────────────────────────────────────────────
    private Map postToGemini(String prompt, double temperature) {
        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
            "generationConfig", Map.of("temperature", temperature, "responseMimeType", "application/json")
        );
        return webClient.post()
            .uri(b -> b.queryParam("key", geminiApiKey).build())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(Map.class)
            .block();
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map response) {
        if (response == null || !response.containsKey("candidates")) return null;
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates.isEmpty()) return null;
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) return null;
        return (String) parts.get(0).get("text");
    }

    private String cleanJson(String s) {
        if (s == null) return "";
        s = s.trim();
        if (s.startsWith("```json")) s = s.substring(7);
        if (s.startsWith("```")) s = s.substring(3);
        if (s.endsWith("```")) s = s.substring(0, s.length() - 3);
        return s.trim();
    }

    private void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
