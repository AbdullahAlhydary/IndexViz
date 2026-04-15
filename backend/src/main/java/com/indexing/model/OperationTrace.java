package com.indexing.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

/**
 * Detailed trace of a hash table operation for visualization.
 * Every insert, delete, search, and update produces one of these,
 * recording the full algorithmic path taken.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OperationTrace {

    private String operation;         // "INSERT", "DELETE", "SEARCH_BY_ID", "SEARCH_BY_FIRST_NAME", "SEARCH_BY_LAST_NAME", "UPDATE"
    private String hashFunction;      // "id % 151"
    private int inputKey;
    private String inputKeyString;
    private int initialHash;
    private List<ProbeStep> probingSequence;
    private int collisionCount;
    private int probeCount;
    private int finalSlot;
    private int levelIndex;
    private String levelName;
    private int identifierIndex;
    private Map<String, Object> indexUpdates;
    private boolean success;
    private String message;
    private long durationNanos;
    private StudentDTO result;        // the student found or affected
    private List<StudentDTO> results; // multiple results for name searches

    public OperationTrace() {}

    // ========== Getters ==========

    public String getOperation() {
        return operation;
    }

    public String getHashFunction() {
        return hashFunction;
    }

    public int getInputKey() {
        return inputKey;
    }

    public String getInputKeyString() {
        return inputKeyString;
    }

    public int getInitialHash() {
        return initialHash;
    }

    public List<ProbeStep> getProbingSequence() {
        return probingSequence;
    }

    public int getCollisionCount() {
        return collisionCount;
    }

    public int getProbeCount() {
        return probeCount;
    }

    public int getFinalSlot() {
        return finalSlot;
    }

    public int getLevelIndex() {
        return levelIndex;
    }

    public String getLevelName() {
        return levelName;
    }

    public int getIdentifierIndex() {
        return identifierIndex;
    }

    public Map<String, Object> getIndexUpdates() {
        return indexUpdates;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public long getDurationNanos() {
        return durationNanos;
    }

    public StudentDTO getResult() {
        return result;
    }

    public List<StudentDTO> getResults() {
        return results;
    }

    // ========== Setters ==========

    public void setOperation(String operation) {
        this.operation = operation;
    }

    public void setHashFunction(String hashFunction) {
        this.hashFunction = hashFunction;
    }

    public void setInputKey(int inputKey) {
        this.inputKey = inputKey;
    }

    public void setInputKeyString(String inputKeyString) {
        this.inputKeyString = inputKeyString;
    }

    public void setInitialHash(int initialHash) {
        this.initialHash = initialHash;
    }

    public void setProbingSequence(List<ProbeStep> probingSequence) {
        this.probingSequence = probingSequence;
    }

    public void setCollisionCount(int collisionCount) {
        this.collisionCount = collisionCount;
    }

    public void setProbeCount(int probeCount) {
        this.probeCount = probeCount;
    }

    public void setFinalSlot(int finalSlot) {
        this.finalSlot = finalSlot;
    }

    public void setLevelIndex(int levelIndex) {
        this.levelIndex = levelIndex;
    }

    public void setLevelName(String levelName) {
        this.levelName = levelName;
    }

    public void setIdentifierIndex(int identifierIndex) {
        this.identifierIndex = identifierIndex;
    }

    public void setIndexUpdates(Map<String, Object> indexUpdates) {
        this.indexUpdates = indexUpdates;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setDurationNanos(long durationNanos) {
        this.durationNanos = durationNanos;
    }

    public void setResult(StudentDTO result) {
        this.result = result;
    }

    public void setResults(List<StudentDTO> results) {
        this.results = results;
    }
}
