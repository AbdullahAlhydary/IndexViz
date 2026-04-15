package com.indexing.model;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * State of a single slot in the hash table for visualization.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SlotState {

    private int index;
    private String status;         // "E" (empty), "O" (occupied), "D" (deleted)
    private StudentDTO student;    // null if empty or deleted
    private int naturalHash;       // what ID would hash to this slot (-1 if empty)
    private boolean isDisplaced;   // true if student's natural hash != this slot

    public SlotState() {}

    public SlotState(int index, String status, StudentDTO student, int naturalHash, boolean isDisplaced) {
        this.index = index;
        this.status = status;
        this.student = student;
        this.naturalHash = naturalHash;
        this.isDisplaced = isDisplaced;
    }

    // ========== Getters ==========

    public int getIndex() {
        return index;
    }

    public String getStatus() {
        return status;
    }

    public StudentDTO getStudent() {
        return student;
    }

    public int getNaturalHash() {
        return naturalHash;
    }

    public boolean isIsDisplaced() {
        return isDisplaced;
    }

    // ========== Setters ==========

    public void setIndex(int index) {
        this.index = index;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setStudent(StudentDTO student) {
        this.student = student;
    }

    public void setNaturalHash(int naturalHash) {
        this.naturalHash = naturalHash;
    }

    public void setIsDisplaced(boolean isDisplaced) {
        this.isDisplaced = isDisplaced;
    }
}
