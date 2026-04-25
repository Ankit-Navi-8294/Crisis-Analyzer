package com.crisis.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
public class NewsService {

    private final WebClient webClient;

    @Value("${newsapi.key}")
    private String newsApiKey;

    public NewsService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://newsapi.org/v2").build();
    }

    public List<Map<String, String>> fetchCrisisNews() {
        // Stricter query focusing on immediate rapid crises: war, nuclear, disaster, collapse, emergency
        String query = "(war OR conflict OR nuclear OR missile OR explosion OR earthquake OR tsunami OR 'coup d'etat' OR 'state of emergency' OR 'economic collapse') AND (breaking OR alert OR crisis)";
        
        try {
            Map response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/everything")
                    .queryParam("q", query)
                    .queryParam("language", "en")
                    .queryParam("sortBy", "relevancy") // Relevancy helps get the "crisis" aspect better than just time
                    .queryParam("pageSize", 20)
                    .queryParam("apiKey", newsApiKey)
                    .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            List<Map<String, String>> newsItems = new ArrayList<>();
            if (response != null && response.containsKey("articles")) {
                List<Map<String, Object>> articles = (List<Map<String, Object>>) response.get("articles");
                for (Map<String, Object> article : articles) {
                    String title = article.get("title") != null ? article.get("title").toString() : "";
                    String description = article.get("description") != null ? article.get("description").toString() : "";
                    String content = article.get("content") != null ? article.get("content").toString() : "";
                    
                    if (title.isEmpty() || title.equals("[Removed]")) {
                        continue;
                    }

                    // Aggressive filtering for hackathon quality
                    String lowerTitle = title.toLowerCase();
                    String lowerDesc = (description != null) ? description.toLowerCase() : "";
                    
                    if (lowerTitle.contains("review") || lowerTitle.contains("deal") || lowerTitle.contains("score") ||
                        lowerTitle.contains("entertainment") || lowerTitle.contains("hollywood") || 
                        lowerTitle.contains("sports") || lowerTitle.contains("lifestyle") ||
                        lowerDesc.contains("subscription") || lowerDesc.contains("best buy") ||
                        lowerTitle.contains("horoscope") || lowerTitle.contains("recipe")) {
                        continue;
                    }

                    Map<String, String> item = Map.of(
                        "title", title,
                        "description", description,
                        "content", content
                    );
                    newsItems.add(item);
                }
            }
            return newsItems;
        } catch (Exception e) {
            System.err.println("Failed to fetch news from NewsAPI: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}
