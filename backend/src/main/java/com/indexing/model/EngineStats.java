package com.indexing.model;

import java.util.Map;

/**
 * Aggregate statistics for the indexing engine.
 */
public class EngineStats {

    private int totalStudents;
    private int capacity;
    private int totalSlots;                        // 4 * 151 = 604
    private Map<String, Integer> studentsPerLevel;
    private Map<String, Double> loadFactorPerLevel;
    private double overallLoadFactor;
    private int totalCollisions;                   // accumulated since last reset
    private int totalProbes;
    private int idIndexSize;
    private int firstNameIndexSize;
    private int lastNameIndexSize;
    private int tombstoneCount;

    public EngineStats() {}

    // ========== Getters ==========

    public int getTotalStudents() {
        return totalStudents;
    }

    public int getCapacity() {
        return capacity;
    }

    public int getTotalSlots() {
        return totalSlots;
    }

    public Map<String, Integer> getStudentsPerLevel() {
        return studentsPerLevel;
    }

    public Map<String, Double> getLoadFactorPerLevel() {
        return loadFactorPerLevel;
    }

    public double getOverallLoadFactor() {
        return overallLoadFactor;
    }

    public int getTotalCollisions() {
        return totalCollisions;
    }

    public int getTotalProbes() {
        return totalProbes;
    }

    public int getIdIndexSize() {
        return idIndexSize;
    }

    public int getFirstNameIndexSize() {
        return firstNameIndexSize;
    }

    public int getLastNameIndexSize() {
        return lastNameIndexSize;
    }

    public int getTombstoneCount() {
        return tombstoneCount;
    }

    // ========== Setters ==========

    public void setTotalStudents(int totalStudents) {
        this.totalStudents = totalStudents;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public void setTotalSlots(int totalSlots) {
        this.totalSlots = totalSlots;
    }

    public void setStudentsPerLevel(Map<String, Integer> studentsPerLevel) {
        this.studentsPerLevel = studentsPerLevel;
    }

    public void setLoadFactorPerLevel(Map<String, Double> loadFactorPerLevel) {
        this.loadFactorPerLevel = loadFactorPerLevel;
    }

    public void setOverallLoadFactor(double overallLoadFactor) {
        this.overallLoadFactor = overallLoadFactor;
    }

    public void setTotalCollisions(int totalCollisions) {
        this.totalCollisions = totalCollisions;
    }

    public void setTotalProbes(int totalProbes) {
        this.totalProbes = totalProbes;
    }

    public void setIdIndexSize(int idIndexSize) {
        this.idIndexSize = idIndexSize;
    }

    public void setFirstNameIndexSize(int firstNameIndexSize) {
        this.firstNameIndexSize = firstNameIndexSize;
    }

    public void setLastNameIndexSize(int lastNameIndexSize) {
        this.lastNameIndexSize = lastNameIndexSize;
    }

    public void setTombstoneCount(int tombstoneCount) {
        this.tombstoneCount = tombstoneCount;
    }
}
