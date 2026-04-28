package com.crisis.backend.controller;

import com.crisis.backend.model.Analysis;
import com.crisis.backend.repository.AnalysisRepository;
import com.crisis.backend.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@org.springframework.web.bind.annotation.CrossOrigin(origins = "https://crisis-analyzer.vercel.app")
@RestController
public class AnalysisController {

    private final AnalysisService analysisService;
    private final AnalysisRepository analysisRepository;
    private final com.crisis.backend.service.AIService aiService;

    public AnalysisController(AnalysisService analysisService, AnalysisRepository analysisRepository, com.crisis.backend.service.AIService aiService) {
        this.analysisService = analysisService;
        this.analysisRepository = analysisRepository;
        this.aiService = aiService;
    }

    @org.springframework.web.bind.annotation.PostMapping("/chat")
    public ResponseEntity<java.util.Map<String, String>> chat(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> request) {
        String title = request.get("title");
        String message = request.get("message");

        java.util.Optional<Analysis> analysis = analysisRepository.findByTitle(title);
        if (analysis.isPresent()) {
            String context = "Impact: " + analysis.get().getImpact() + " | Risk: " + analysis.get().getRiskLevel();
            String response = aiService.chatAboutArticle(title, context, message);
            return ResponseEntity.ok(java.util.Map.of("response", response));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/analyze")
    public ResponseEntity<?> getAnalysis() {
        try {
            List<Analysis> results = analysisService.processGlobalRisks();
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", "Backend Failure",
                "message", e.getMessage() != null ? e.getMessage() : e.getClass().getName()
            ));
        }
    }

    @DeleteMapping("/analyze/clear")
    public ResponseEntity<String> clearAnalyses() {
        analysisRepository.deleteAll();
        return ResponseEntity.ok("All cached analyses cleared.");
    }
}
