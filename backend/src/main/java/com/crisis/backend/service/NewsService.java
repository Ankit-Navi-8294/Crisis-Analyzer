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

    private final java.util.Random random = new java.util.Random();

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
                    .queryParam("sortBy", random.nextBoolean() ? "relevancy" : "publishedAt") 
                    .queryParam("pageSize", 40) // Fetch more to allow shuffling
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
                // Shuffle to provide variety if the same articles are returned
                java.util.Collections.shuffle(newsItems);
            }
            if (newsItems.isEmpty()) {
                System.out.println("No news fetched from API, using mock crisis data for demo.");
                return getMockNews();
            }
            return newsItems;
        } catch (Exception e) {
            System.err.println("Failed to fetch news from NewsAPI: " + e.getMessage());
            return getMockNews();
        }
    }

    private List<Map<String, String>> getMockNews() {
        List<Map<String, String>> mock = new ArrayList<>();
        mock.add(Map.of(
            "title", "Sudden Military Escalation in Ukraine and Russia Disrupts Global Wheat Supply",
            "description", "New hostilities near key Black Sea export ports have halted grain shipments, sending global wheat futures to record highs.",
            "content", "As military maneuvers intensify, major shipping lanes in the Black Sea have been declared high-risk zones. Economists warn of a looming food security crisis in developing nations."
        ));
        mock.add(Map.of(
            "title", "Massive Cyber Attack Targets United States Banking SWIFT Network",
            "description", "A coordinated ransomware attack has paralyzed international transaction systems for several major financial institutions in the USA.",
            "content", "The breach has caused widespread panic in currency markets. Experts suggest the attack originated from a state-sponsored actor, aiming to destabilize the global financial order."
        ));
        mock.add(Map.of(
            "title", "Unprecedented Drought in Panama Canal Forces 50% Reduction in Cargo Traffic",
            "description", "Extreme climate conditions in Panama have lowered water levels to historic lows, creating a massive bottleneck in global trade.",
            "content", "Ships are currently waiting up to 20 days to transit, causing a ripple effect across retail supply chains in the United States and Europe just ahead of peak season."
        ));
        mock.add(Map.of(
            "title", "Taiwan Semiconductor Hub Hit by Catastrophic Typhoon Damage",
            "description", "A Category 5 typhoon has caused severe flooding in Hsinchu Science Park, Taiwan, the world's most critical chip manufacturing center.",
            "content", "While early assessments are ongoing, the disruption to high-end AI chip production in Taiwan is expected to last for at least one fiscal quarter, impacting tech giants globally."
        ));
        mock.add(Map.of(
            "title", "Germany Announces Critical Energy Shortage Amid Pipeline Failure",
            "description", "A major technical failure in the North Sea pipeline has forced Germany to declare a state of emergency for its industrial sector.",
            "content", "Gas prices have surged 40% across Europe. The German government is considering mandatory energy rationing to preserve strategic reserves for the winter."
        ));
        mock.add(Map.of(
            "title", "South China Sea Tensions Rise Following Naval Standoff",
            "description", "Multiple coast guard vessels were involved in a heated confrontation over disputed fishing grounds, sparking international concern.",
            "content", "Diplomatic channels are working at capacity to de-escalate the situation, but markets in Southeast Asia have already begun showing signs of regional instability."
        ));
        mock.add(Map.of(
            "title", "Hyperinflation Crisis Triggers Massive Protests in South America",
            "description", "A sudden collapse of the local currency has led to widespread civil unrest and supply shortages in major urban centers.",
            "content", "International aid agencies are preparing emergency responses as the economic crisis threatens to spill over into neighboring countries."
        ));
        
        java.util.Collections.shuffle(mock);
        return mock;
    }
}
