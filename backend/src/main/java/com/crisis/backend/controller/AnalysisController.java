package com.crisis.backend.controller;

import com.crisis.backend.model.Analysis;
import com.crisis.backend.repository.AnalysisRepository;
import com.crisis.backend.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AnalysisController {

    private final AnalysisService analysisService;
    private final AnalysisRepository analysisRepository;

    public AnalysisController(AnalysisService analysisService, AnalysisRepository analysisRepository) {
        this.analysisService = analysisService;
        this.analysisRepository = analysisRepository;
    }

    @GetMapping("/analyze")
    public ResponseEntity<List<Analysis>> getAnalysis() {
        try {
            List<Analysis> results = analysisService.processGlobalRisks();
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/analyze/clear")
    public ResponseEntity<String> clearAnalyses() {
        analysisRepository.deleteAll();
        return ResponseEntity.ok("All cached analyses cleared.");
    }
}
