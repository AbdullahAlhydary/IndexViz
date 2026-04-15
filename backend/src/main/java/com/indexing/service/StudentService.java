package com.indexing.service;

import com.indexing.engine.Collector;
import com.indexing.model.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service layer wrapping the Collector engine.
 * Each method delegates to Collector and returns either an ApiResponse or the relevant model.
 */
@Service
public class StudentService {

    private final Collector collector;

    public StudentService(Collector collector) {
        this.collector = collector;
    }

    // ========== CRUD ==========

    /**
     * Add a new student. Returns ApiResponse with OperationTrace.
     */
    public ApiResponse<StudentDTO> addStudent(StudentDTO dto) {
        if (collector.containsId(dto.getId())) {
            return ApiResponse.error("Student with ID " + dto.getId() + " already exists");
        }

        OperationTrace trace = collector.addNewStudent(dto);

        if (trace.isSuccess()) {
            ApiResponse<StudentDTO> response = ApiResponse.success(trace.getMessage(), trace.getResult(), trace);
            return response;
        } else {
            ApiResponse<StudentDTO> response = new ApiResponse<>();
            response.setSuccess(false);
            response.setMessage(trace.getMessage());
            response.setTrace(trace);
            return response;
        }
    }

    /**
     * Delete a student by ID. Returns ApiResponse with OperationTrace.
     */
    public ApiResponse<StudentDTO> deleteStudent(int id) {
        OperationTrace trace = collector.deleteStudent(id);

        if (trace.isSuccess()) {
            return ApiResponse.success(trace.getMessage(), trace.getResult(), trace);
        } else {
            ApiResponse<StudentDTO> response = new ApiResponse<>();
            response.setSuccess(false);
            response.setMessage(trace.getMessage());
            response.setTrace(trace);
            return response;
        }
    }

    /**
     * Update a student field. Accepts a StudentDTO with the fields to update.
     * Only the non-null fields in the DTO are applied.
     */
    public ApiResponse<StudentDTO> updateStudent(int id, StudentDTO updates) {
        if (!collector.containsId(id)) {
            return ApiResponse.error("Student with ID " + id + " not found");
        }

        // Determine which field changed. We apply the first non-null field found.
        // Priority: universityLevel, lastName, firstName, dateOfBirth
        OperationTrace trace = null;

        if (updates.getUniversityLevel() != null && !updates.getUniversityLevel().isBlank()) {
            trace = collector.editStudent(id, "universityLevel", updates.getUniversityLevel());
        } else if (updates.getLastName() != null && !updates.getLastName().isBlank()) {
            trace = collector.editStudent(id, "lastName", updates.getLastName());
        } else if (updates.getFirstName() != null && !updates.getFirstName().isBlank()) {
            trace = collector.editStudent(id, "firstName", updates.getFirstName());
        } else if (updates.getDateOfBirth() != null && !updates.getDateOfBirth().isBlank()) {
            trace = collector.editStudent(id, "dateOfBirth", updates.getDateOfBirth());
        } else {
            return ApiResponse.error("No valid field to update");
        }

        if (trace.isSuccess()) {
            return ApiResponse.success(trace.getMessage(), trace.getResult(), trace);
        } else {
            ApiResponse<StudentDTO> response = new ApiResponse<>();
            response.setSuccess(false);
            response.setMessage(trace.getMessage());
            response.setTrace(trace);
            return response;
        }
    }

    // ========== SEARCH ==========

    /**
     * Search by student ID. Returns ApiResponse with OperationTrace.
     */
    public ApiResponse<StudentDTO> searchById(int id) {
        OperationTrace trace = collector.searchByID(id);
        if (trace.isSuccess()) {
            return ApiResponse.success(trace.getMessage(), trace.getResult(), trace);
        } else {
            ApiResponse<StudentDTO> response = new ApiResponse<>();
            response.setSuccess(false);
            response.setMessage(trace.getMessage());
            response.setTrace(trace);
            return response;
        }
    }

    /**
     * Search by first name. Returns ApiResponse with list of matching students and OperationTrace.
     */
    public ApiResponse<List<StudentDTO>> searchByFirstName(String name) {
        OperationTrace trace = collector.searchByFirstName(name);
        if (trace.isSuccess()) {
            return ApiResponse.success(trace.getMessage(), trace.getResults(), trace);
        } else {
            ApiResponse<List<StudentDTO>> response = new ApiResponse<>();
            response.setSuccess(false);
            response.setMessage(trace.getMessage());
            response.setTrace(trace);
            return response;
        }
    }

    /**
     * Search by last name. Returns ApiResponse with list of matching students and OperationTrace.
     */
    public ApiResponse<List<StudentDTO>> searchByLastName(String name) {
        OperationTrace trace = collector.searchByLastName(name);
        if (trace.isSuccess()) {
            return ApiResponse.success(trace.getMessage(), trace.getResults(), trace);
        } else {
            ApiResponse<List<StudentDTO>> response = new ApiResponse<>();
            response.setSuccess(false);
            response.setMessage(trace.getMessage());
            response.setTrace(trace);
            return response;
        }
    }

    // ========== LIST ==========

    /**
     * Get students by academic level (FR, SO, JR, SR).
     */
    public List<StudentDTO> getStudentsByLevel(String level) {
        return collector.getStudentsByLevel(level.toUpperCase());
    }

    /**
     * Get all students across all levels.
     */
    public List<StudentDTO> getAllStudents() {
        return collector.getAllStudents();
    }

    // ========== ENGINE STATE ==========

    /**
     * Get full engine statistics.
     */
    public EngineStats getStats() {
        return collector.getStats();
    }

    /**
     * Get the complete hash table state for visualization.
     */
    public HashTableState getHashTableState() {
        return collector.getHashTableState();
    }

    // ========== DATA MANAGEMENT ==========

    /**
     * Load sample data from bundled CSV. Returns ApiResponse with count of loaded students.
     */
    public ApiResponse<Object> loadSampleData() {
        List<OperationTrace> traces = collector.loadSampleData();

        int successCount = 0;
        int failCount = 0;
        for (OperationTrace t : traces) {
            if (t.isSuccess()) successCount++;
            else failCount++;
        }

        java.util.Map<String, Object> data = new java.util.LinkedHashMap<>();
        data.put("loaded", successCount);
        data.put("failed", failCount);
        data.put("total", traces.size());

        return ApiResponse.success(
                "Loaded " + successCount + " students (" + failCount + " failed)",
                data
        );
    }

    /**
     * Reset the engine -- clear all data.
     */
    public ApiResponse<Object> resetEngine() {
        collector.reset();
        return ApiResponse.success("Engine reset successfully. All data cleared.", null);
    }

    /**
     * Import students from CSV content string. Returns ApiResponse with batch results.
     */
    public ApiResponse<Object> importCsv(String csvContent) {
        List<OperationTrace> traces = collector.importCsv(csvContent);

        int successCount = 0;
        int failCount = 0;
        for (OperationTrace t : traces) {
            if (t.isSuccess()) successCount++;
            else failCount++;
        }

        java.util.Map<String, Object> data = new java.util.LinkedHashMap<>();
        data.put("imported", successCount);
        data.put("failed", failCount);
        data.put("total", traces.size());
        // Include first 10 traces for inspection
        data.put("traces", traces.subList(0, Math.min(10, traces.size())));

        return ApiResponse.success(
                "Imported " + successCount + " students (" + failCount + " failed)",
                data
        );
    }

    // ========== PERFORMANCE ==========

    /**
     * Compare indexed vs linear search performance.
     * @param type "id", "firstName", or "lastName"
     * @param key the search key
     */
    public PerformanceComparison comparePerformance(String type, String key) {
        return collector.comparePerformance(type, key);
    }
}
