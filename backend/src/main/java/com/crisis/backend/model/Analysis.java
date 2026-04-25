package com.crisis.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "analyses")
public class Analysis {

    @Id
    private String id;
    
    private String title;
    private List<String> countriesAffected;
    private String impact;
    private String shortTerm;
    private String longTerm;
    private String riskLevel;
    private List<String> suggestions;
    private double sentimentScore; // -1.0 to 1.0
    private String mediaBias; // e.g., "Pro-Western", "Economic-Focused", etc.
    private LocalDateTime createdAt;

    public Analysis() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getCountriesAffected() {
        return countriesAffected;
    }

    public void setCountriesAffected(List<String> countriesAffected) {
        this.countriesAffected = countriesAffected;
    }

    public String getImpact() {
        return impact;
    }

    public void setImpact(String impact) {
        this.impact = impact;
    }

    public String getShortTerm() {
        return shortTerm;
    }

    public void setShortTerm(String shortTerm) {
        this.shortTerm = shortTerm;
    }

    public String getLongTerm() {
        return longTerm;
    }

    public void setLongTerm(String longTerm) {
        this.longTerm = longTerm;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public double getSentimentScore() {
        return sentimentScore;
    }

    public void setSentimentScore(double sentimentScore) {
        this.sentimentScore = sentimentScore;
    }

    public String getMediaBias() {
        return mediaBias;
    }

    public void setMediaBias(String mediaBias) {
        this.mediaBias = mediaBias;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
