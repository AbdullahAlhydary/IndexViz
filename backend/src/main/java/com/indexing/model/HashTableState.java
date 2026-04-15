package com.indexing.model;

import java.util.List;

/**
 * Represents the full state of the hash table for visualization.
 * Contains all 4 academic levels, each with 151 slots.
 */
public class HashTableState {

    private int capacity;
    private List<LevelState> levels; // 4 levels

    public HashTableState() {}

    public HashTableState(int capacity, List<LevelState> levels) {
        this.capacity = capacity;
        this.levels = levels;
    }

    // ========== Getters ==========

    public int getCapacity() {
        return capacity;
    }

    public List<LevelState> getLevels() {
        return levels;
    }

    // ========== Setters ==========

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public void setLevels(List<LevelState> levels) {
        this.levels = levels;
    }
}
