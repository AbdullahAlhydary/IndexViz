package com.indexing.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Data Transfer Object for student data in API requests and responses.
 * Includes validation annotations for controller-layer input validation.
 */
public class StudentDTO {

    @NotNull(message = "Student ID is required")
    @Min(value = 10000, message = "ID must be between 10000 and 99999")
    @Max(value = 99999, message = "ID must be between 10000 and 99999")
    private Integer id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String dateOfBirth;

    @NotBlank(message = "University level is required")
    @Pattern(regexp = "^(FR|SO|JR|SR)$", message = "University level must be FR, SO, JR, or SR")
    private String universityLevel;

    public StudentDTO() {}

    public StudentDTO(int id, String firstName, String lastName, String dateOfBirth, String universityLevel) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.universityLevel = universityLevel;
    }

    // ========== Getters ==========

    public Integer getId() {
        return id;
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

    // ========== Setters ==========

    public void setId(Integer id) {
        this.id = id;
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
    }
}
