package com.indexing.model;

import java.util.List;

/**
 * State of one academic level's hash table (one of the 4 sub-tables).
 */
public class LevelState {

    private String levelName;    // "FR", "SO", "JR", "SR"
    private int levelIndex;      // 0-3
    private List<SlotState> slots; // 151 slots
    private int occupiedCount;
    private int deletedCount;
    private int emptyCount;
    private double loadFactor;

    public LevelState() {}

    // ========== Getters ==========

    public String getLevelName() {
        return levelName;
    }

    public int getLevelIndex() {
        return levelIndex;
    }

    public List<SlotState> getSlots() {
        return slots;
    }

    public int getOccupiedCount() {
        return occupiedCount;
    }

    public int getDeletedCount() {
        return deletedCount;
    }

    public int getEmptyCount() {
        return emptyCount;
    }

    public double getLoadFactor() {
        return loadFactor;
    }

    // ========== Setters ==========

    public void setLevelName(String levelName) {
        this.levelName = levelName;
    }

    public void setLevelIndex(int levelIndex) {
        this.levelIndex = levelIndex;
    }

    public void setSlots(List<SlotState> slots) {
        this.slots = slots;
    }

    public void setOccupiedCount(int occupiedCount) {
        this.occupiedCount = occupiedCount;
    }

    public void setDeletedCount(int deletedCount) {
        this.deletedCount = deletedCount;
    }

    public void setEmptyCount(int emptyCount) {
        this.emptyCount = emptyCount;
    }

    public void setLoadFactor(double loadFactor) {
        this.loadFactor = loadFactor;
    }
}
