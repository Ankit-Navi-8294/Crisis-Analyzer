package com.crisis.backend.service;

import com.crisis.backend.model.Analysis;
import com.crisis.backend.repository.AnalysisRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Arrays;

@Service
public class AnalysisService {

    private final NewsService newsService;
    private final AIService aiService;
    private final AnalysisRepository analysisRepository;

    public AnalysisService(NewsService newsService, AIService aiService, AnalysisRepository analysisRepository) {
        this.newsService = newsService;
        this.aiService = aiService;
        this.analysisRepository = analysisRepository;
    }

    public List<Analysis> processGlobalRisks() {
        List<Map<String, String>> newsItems = newsService.fetchCrisisNews();
        List<Analysis> results = new ArrayList<>();

        if (newsItems.isEmpty()) {
            return results;
        }

        // 1. AI Filtering
        List<Map<String, Object>> filteredImportantNews = aiService.filterImportantNews(newsItems);
        
        // FALLBACK: If Gemini 503s during filtering, pick the first 9 articles
        if (filteredImportantNews.isEmpty()) {
            for (int i = 0; i < Math.min(9, newsItems.size()); i++) {
                filteredImportantNews.add(Map.of("index", i, "reason", "Fallback selection"));
            }
        }

        // 2. Select articles and limit to max 9
        int count = 0;
        for (Map<String, Object> importantInfo : filteredImportantNews) {
            if (count >= 9) break;

            Integer index = (Integer) importantInfo.get("index");
            if (index != null && index >= 0 && index < newsItems.size()) {
                Map<String, String> item = newsItems.get(index);
                String title = item.get("title");
                String description = item.get("description");
                String content = description + " " + item.get("content");

                // Optimization: Avoid duplicate analysis
                Optional<Analysis> existingAnalysis = analysisRepository.findByTitle(title);
                if (existingAnalysis.isPresent()) {
                    results.add(existingAnalysis.get());
                    count++;
                    continue;
                }

                // Rate limiting handled in AIService

                // 3. Detailed Analysis via AI
                Analysis newAnalysis = aiService.analyzeNews(title, content);
                
                // FALLBACK: If Gemini fails, generate headline-specific analysis
                if (newAnalysis == null) {
                    newAnalysis = buildFallbackAnalysis(title, description, count);
                }

                Analysis savedAnalysis = analysisRepository.save(newAnalysis);
                results.add(savedAnalysis);
                count++;
            }
        }

        return results;
    }

    private Analysis buildFallbackAnalysis(String title, String description, int index) {
        Analysis a = new Analysis();
        a.setTitle(title);

        String lower = (title + " " + description).toLowerCase();
        
        // Determine risk level
        if (lower.contains("war") || lower.contains("nuclear") || lower.contains("attack") || 
            lower.contains("conflict") || lower.contains("collapse") || lower.contains("invasion") || lower.contains("missile")) {
            a.setRiskLevel("High");
        } else if (lower.contains("sanction") || lower.contains("tariff") || lower.contains("tension") ||
                   lower.contains("crisis") || lower.contains("inflation") || lower.contains("military") || lower.contains("standoff")) {
            a.setRiskLevel("Medium");
        } else {
            a.setRiskLevel("Low");
        }

        // Extract countries
        List<String> countries = extractCountries(title + " " + description);
        if (countries.isEmpty()) {
            countries = Arrays.asList("Global Impact");
        }
        a.setCountriesAffected(countries);

        // Dynamically build text based on risk
        String entityStr = countries.contains("Global Impact") ? "global markets" : String.join(" and ", countries);
        
        if ("High".equals(a.getRiskLevel())) {
            a.setImpact("Severe destabilization risk. The events outlined in '" + title + "' pose an immediate threat to " + entityStr + ", likely causing severe supply chain breakdowns and broad market sell-offs.");
            a.setShortTerm("Expect intense market volatility over the next 1-3 months. Energy and commodity sectors linked to " + entityStr + " will experience price shocks.");
            a.setLongTerm("Permanent restructuring of regional alliances. Foreign direct investment in " + entityStr + " will stall for 2-5 years until stabilization occurs.");
            a.setSuggestions(Arrays.asList(
                "Immediately freeze non-essential capital deployment in " + entityStr + ".",
                "Activate emergency supply chain contingencies for affected regions.",
                "Hedge heavily against sudden currency depreciation."
            ));
        } else if ("Medium".equals(a.getRiskLevel())) {
            a.setImpact("Moderate economic friction. The situation described in '" + title + "' creates uncertainty for " + entityStr + ", potentially increasing operational costs and trade tariffs.");
            a.setShortTerm("Minor disruptions in cross-border trade and localized inflation spikes within " + entityStr + " over the next 3-6 months.");
            a.setLongTerm("Gradual shift in trade policies and increased regulatory scrutiny over the next 12-18 months.");
            a.setSuggestions(Arrays.asList(
                "Audit supply chain exposure to " + entityStr + " and identify secondary suppliers.",
                "Monitor regulatory and tariff changes closely.",
                "Review pricing strategies to absorb potential localized inflation."
            ));
        } else {
            a.setImpact("Low-level geopolitical noise. The developments regarding '" + title + "' show minimal immediate economic disruption to " + entityStr + ".");
            a.setShortTerm("Negligible broader market effect. Specific local sectors in " + entityStr + " might see minor volatility for a few weeks.");
            a.setLongTerm("No major structural changes expected, though it serves as an indicator of broader trends in " + entityStr + ".");
            a.setSuggestions(Arrays.asList(
                "Maintain standard operational protocols.",
                "Keep a watching brief on " + entityStr + " for any sudden escalation.",
                "Reassess quarterly if tensions begin to rise."
            ));
        }
        
        // Fix risk level override from ternary condition
        a.setRiskLevel(lower.contains("war") || lower.contains("nuclear") || lower.contains("attack") || lower.contains("conflict") || lower.contains("collapse") || lower.contains("invasion") || lower.contains("missile") ? "High" : 
                       (lower.contains("sanction") || lower.contains("tariff") || lower.contains("tension") || lower.contains("crisis") || lower.contains("inflation") || lower.contains("military") || lower.contains("standoff") ? "Medium" : "Low"));

        return a;
    }

    private List<String> extractCountries(String text) {
        List<String> found = new ArrayList<>();
        String lower = text.toLowerCase();
        
        // Map of keyword -> proper country name
        Map<String, String> countryMap = Map.ofEntries(
            Map.entry("united states", "United States"),
            Map.entry("u.s.", "United States"),
            Map.entry("us ", "United States"),
            Map.entry("america", "United States"),
            Map.entry("iran", "Iran"),
            Map.entry("china", "China"),
            Map.entry("chinese", "China"),
            Map.entry("russia", "Russia"),
            Map.entry("russian", "Russia"),
            Map.entry("ukraine", "Ukraine"),
            Map.entry("ukrainian", "Ukraine"),
            Map.entry("india", "India"),
            Map.entry("indian", "India"),
            Map.entry("germany", "Germany"),
            Map.entry("german", "Germany"),
            Map.entry("japan", "Japan"),
            Map.entry("japanese", "Japan"),
            Map.entry("north korea", "North Korea"),
            Map.entry("south korea", "South Korea"),
            Map.entry("taiwan", "Taiwan"),
            Map.entry("saudi", "Saudi Arabia"),
            Map.entry("israel", "Israel"),
            Map.entry("israeli", "Israel"),
            Map.entry("palestine", "Palestine"),
            Map.entry("palestinian", "Palestine"),
            Map.entry("turkey", "Turkey"),
            Map.entry("turkish", "Turkey"),
            Map.entry("europe", "Europe"),
            Map.entry("european", "Europe"),
            Map.entry("uk ", "United Kingdom"),
            Map.entry("britain", "United Kingdom"),
            Map.entry("british", "United Kingdom"),
            Map.entry("france", "France"),
            Map.entry("french", "France"),
            Map.entry("pakistan", "Pakistan"),
            Map.entry("australia", "Australia"),
            Map.entry("canada", "Canada"),
            Map.entry("brazil", "Brazil"),
            Map.entry("mexico", "Mexico"),
            Map.entry("syria", "Syria"),
            Map.entry("iraq", "Iraq"),
            Map.entry("yemen", "Yemen"),
            Map.entry("afghanistan", "Afghanistan"),
            Map.entry("egypt", "Egypt")
        );

        for (Map.Entry<String, String> entry : countryMap.entrySet()) {
            if (lower.contains(entry.getKey()) && !found.contains(entry.getValue())) {
                found.add(entry.getValue());
            }
        }

        return found;
    }
}
