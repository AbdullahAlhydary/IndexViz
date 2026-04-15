package com.indexing.model;

import java.util.List;

/**
 * Compares indexed vs. naive linear search performance for a single query.
 */
public class PerformanceComparison {

    private String searchType;         // "id", "firstName", "lastName"
    private String searchKey;
    private int indexedSteps;
    private long indexedTimeNanos;
    private int linearSteps;
    private long linearTimeNanos;
    private double speedupFactor;
    private String indexUsed;          // "IdMap", "firstNameMap", "lastNameMap"
    private List<String> indexedPath;  // human-readable path steps
    private List<String> linearPath;   // human-readable path steps

    public PerformanceComparison() {}

    // ========== Getters ==========

    public String getSearchType() {
        return searchType;
    }

    public String getSearchKey() {
        return searchKey;
    }

    public int getIndexedSteps() {
        return indexedSteps;
    }

    public long getIndexedTimeNanos() {
        return indexedTimeNanos;
    }

    public int getLinearSteps() {
        return linearSteps;
    }

    public long getLinearTimeNanos() {
        return linearTimeNanos;
    }

    public double getSpeedupFactor() {
        return speedupFactor;
    }

    public String getIndexUsed() {
        return indexUsed;
    }

    public List<String> getIndexedPath() {
        return indexedPath;
    }

    public List<String> getLinearPath() {
        return linearPath;
    }

    // ========== Setters ==========

    public void setSearchType(String searchType) {
        this.searchType = searchType;
    }

    public void setSearchKey(String searchKey) {
        this.searchKey = searchKey;
    }

    public void setIndexedSteps(int indexedSteps) {
        this.indexedSteps = indexedSteps;
    }

    public void setIndexedTimeNanos(long indexedTimeNanos) {
        this.indexedTimeNanos = indexedTimeNanos;
    }

    public void setLinearSteps(int linearSteps) {
        this.linearSteps = linearSteps;
    }

    public void setLinearTimeNanos(long linearTimeNanos) {
        this.linearTimeNanos = linearTimeNanos;
    }

    public void setSpeedupFactor(double speedupFactor) {
        this.speedupFactor = speedupFactor;
    }

    public void setIndexUsed(String indexUsed) {
        this.indexUsed = indexUsed;
    }

    public void setIndexedPath(List<String> indexedPath) {
        this.indexedPath = indexedPath;
    }

    public void setLinearPath(List<String> linearPath) {
        this.linearPath = linearPath;
    }
}
