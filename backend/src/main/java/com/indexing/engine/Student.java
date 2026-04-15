package com.indexing.engine;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Core Student entity used internally by the Collector.
 * Preserves the original data structure with status markers:
 *   "E" = empty slot, "O" = occupied, "D" = deleted (tombstone).
 *
 * The numLevel field maps university levels to array indices:
 *   FR=0, SO=1, JR=2, SR=3.
 */
public class Student {

    private int id;

    @JsonIgnore
    private String status;

    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String universityLevel;

    @JsonIgnore
    private int numLevel;

    /** Constructor for empty/deleted placeholder slots. */
    public Student(String status) {
        this.status = status;
    }

    /** Constructor for a real occupied student record. Preserves original logic exactly. */
    public Student(int id, String lastName, String firstName, String dateOfBirth, String universityLevel) {
        this.id = id;
        this.status = "O";
        this.lastName = lastName;
        this.firstName = firstName;
        this.dateOfBirth = dateOfBirth;
        this.universityLevel = universityLevel;
        switch (universityLevel) {
            case "FR" -> numLevel = 0;
            case "SO" -> numLevel = 1;
            case "JR" -> numLevel = 2;
            case "SR" -> numLevel = 3;
            default -> numLevel = -1;
        }
    }

    // ========== Getters ==========

    public int getId() {
        return id;
    }

    public String getStatus() {
        return status;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public String getUniversityLevel() {
        return universityLevel;
    }

    public int getNumLevel() {
        return numLevel;
    }

    // ========== Setters ==========

    public void setId(int id) {
        this.id = id;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setUniversityLevel(String universityLevel) {
        this.universityLevel = universityLevel;
        switch (universityLevel) {
            case "FR" -> numLevel = 0;
            case "SO" -> numLevel = 1;
            case "JR" -> numLevel = 2;
            case "SR" -> numLevel = 3;
            default -> numLevel = -1;
        }
    }

    public void setNumLevel(int numLevel) {
        this.numLevel = numLevel;
    }

    @Override
    public String toString() {
        return "Student{id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", dateOfBirth='" + dateOfBirth + '\'' +
                ", universityLevel='" + universityLevel + "'}";
    }
}
