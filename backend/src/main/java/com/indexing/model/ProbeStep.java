package com.indexing.model;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Represents a single step in the quadratic probing sequence.
 * Records the slot checked, the formula used to compute it,
 * what was found there, and whether it constituted a collision.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProbeStep {

    private int step;           // probe number (0, 1, 2, ...)
    private int slot;           // actual slot checked
    private String formula;     // e.g., "(42 + 1^2) % 151 = 43"
    private String slotStatus;  // "EMPTY", "OCCUPIED", "DELETED"
    private boolean isCollision;
    private String occupantInfo; // if occupied, brief info about who's there

    public ProbeStep() {}

    public ProbeStep(int step, int slot, String formula, String slotStatus, boolean isCollision, String occupantInfo) {
        this.step = step;
        this.slot = slot;
        this.formula = formula;
        this.slotStatus = slotStatus;
        this.isCollision = isCollision;
        this.occupantInfo = occupantInfo;
    }

    // ========== Getters ==========

    public int getStep() {
        return step;
    }

    public int getSlot() {
        return slot;
    }

    public String getFormula() {
        return formula;
    }

    public String getSlotStatus() {
        return slotStatus;
    }

    public boolean isIsCollision() {
        return isCollision;
    }

    public String getOccupantInfo() {
        return occupantInfo;
    }

    // ========== Setters ==========

    public void setStep(int step) {
        this.step = step;
    }

    public void setSlot(int slot) {
        this.slot = slot;
    }

    public void setFormula(String formula) {
        this.formula = formula;
    }

    public void setSlotStatus(String slotStatus) {
        this.slotStatus = slotStatus;
    }

    public void setIsCollision(boolean isCollision) {
        this.isCollision = isCollision;
    }

    public void setOccupantInfo(String occupantInfo) {
        this.occupantInfo = occupantInfo;
    }
}
