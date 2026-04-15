package com.indexing.controller;

import com.indexing.model.*;
import com.indexing.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * REST controller for all student and engine operations.
 * Mounted at /api/students.
 */
@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // ========== CREATE ==========

    /** POST / -- add a new student */
    @PostMapping
    public ResponseEntity<ApiResponse<?>> addStudent(
            @Valid @RequestBody StudentDTO dto, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .collect(Collectors.joining("; "));
            return ResponseEntity.badRequest().body(ApiResponse.error(errors));
        }

        ApiResponse<StudentDTO> response = studentService.addStudent(dto);
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
        if (response.getMessage() != null && response.getMessage().contains("already exists")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ========== UPDATE ==========

    /** PUT /{id} -- update student fields */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateStudent(
            @PathVariable int id, @RequestBody StudentDTO updates) {

        // Validate universityLevel if provided
        if (updates.getUniversityLevel() != null
                && !updates.getUniversityLevel().isBlank()
                && !Set.of("FR", "SO", "JR", "SR").contains(updates.getUniversityLevel().toUpperCase())) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Invalid university level. Must be FR, SO, JR, or SR."));
        }

        ApiResponse<StudentDTO> response = studentService.updateStudent(id, updates);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        if (response.getMessage() != null && response.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ========== DELETE ==========

    /** DELETE /{id} -- delete a student */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteStudent(@PathVariable int id) {
        ApiResponse<StudentDTO> response = studentService.deleteStudent(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // ========== SEARCH ==========

    /** GET /search/id/{id} -- search by student ID */
    @GetMapping("/search/id/{id}")
    public ResponseEntity<ApiResponse<?>> searchById(@PathVariable int id) {
        ApiResponse<StudentDTO> response = studentService.searchById(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /** GET /search/firstName/{name} -- search by first name */
    @GetMapping("/search/firstName/{name}")
    public ResponseEntity<ApiResponse<?>> searchByFirstName(@PathVariable String name) {
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("First name cannot be empty"));
        }
        ApiResponse<List<StudentDTO>> response = studentService.searchByFirstName(name);
        return ResponseEntity.ok(response);
    }

    /** GET /search/lastName/{name} -- search by last name */
    @GetMapping("/search/lastName/{name}")
    public ResponseEntity<ApiResponse<?>> searchByLastName(@PathVariable String name) {
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Last name cannot be empty"));
        }
        ApiResponse<List<StudentDTO>> response = studentService.searchByLastName(name);
        return ResponseEntity.ok(response);
    }

    // ========== LIST ==========

    /** GET /level/{level} -- list students by academic level */
    @GetMapping("/level/{level}")
    public ResponseEntity<ApiResponse<?>> getStudentsByLevel(@PathVariable String level) {
        if (!Set.of("FR", "SO", "JR", "SR").contains(level.toUpperCase())) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Invalid level: " + level + ". Must be FR, SO, JR, or SR."));
        }
        List<StudentDTO> students = studentService.getStudentsByLevel(level);
        return ResponseEntity.ok(ApiResponse.success(
                "Found " + students.size() + " students in level " + level.toUpperCase(), students));
    }

    /** GET / -- list all students */
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllStudents() {
        List<StudentDTO> students = studentService.getAllStudents();
        return ResponseEntity.ok(ApiResponse.success(
                "Total students: " + students.size(), students));
    }

    // ========== ENGINE STATE ==========

    /** GET /stats -- engine statistics */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<EngineStats>> getStats() {
        EngineStats stats = studentService.getStats();
        return ResponseEntity.ok(ApiResponse.success("Engine statistics", stats));
    }

    /** GET /hash-table -- full hash table state for visualization */
    @GetMapping("/hash-table")
    public ResponseEntity<ApiResponse<HashTableState>> getHashTableState() {
        HashTableState state = studentService.getHashTableState();
        return ResponseEntity.ok(ApiResponse.success("Hash table state", state));
    }

    // ========== DATA MANAGEMENT ==========

    /** POST /load-sample -- load sample data from bundled CSV */
    @PostMapping("/load-sample")
    public ResponseEntity<ApiResponse<?>> loadSampleData() {
        ApiResponse<Object> response = studentService.loadSampleData();
        return ResponseEntity.ok(response);
    }

    /** POST /reset -- reset the engine (clear all data) */
    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<?>> resetEngine() {
        ApiResponse<Object> response = studentService.resetEngine();
        return ResponseEntity.ok(response);
    }

    /** POST /import-csv -- import CSV content */
    @PostMapping("/import-csv")
    public ResponseEntity<ApiResponse<?>> importCsv(@RequestBody Map<String, String> body) {
        String csvContent = body.get("csvContent");
        if (csvContent == null || csvContent.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("csvContent is required"));
        }
        ApiResponse<Object> response = studentService.importCsv(csvContent);
        return ResponseEntity.ok(response);
    }

    // ========== PERFORMANCE ==========

    /** GET /performance/{type}/{key} -- performance comparison */
    @GetMapping("/performance/{type}/{key}")
    public ResponseEntity<ApiResponse<?>> comparePerformance(
            @PathVariable String type, @PathVariable String key) {
        if (!Set.of("id", "firstName", "lastName").contains(type)) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Invalid type: " + type + ". Must be id, firstName, or lastName."));
        }
        PerformanceComparison comparison = studentService.comparePerformance(type, key);
        return ResponseEntity.ok(ApiResponse.success("Performance comparison", comparison));
    }
}
