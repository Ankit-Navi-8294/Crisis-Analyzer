package com.crisis.backend.repository;

import com.crisis.backend.model.Analysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalysisRepository extends MongoRepository<Analysis, String> {
    Optional<Analysis> findByTitle(String title);
}
