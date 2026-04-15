package com.indexing.engine;

import com.indexing.model.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.*;

/**
 * Instrumented version of the original Collector.
 * Preserves EXACT hashing and quadratic probing logic while adding operation tracing.
 *
 * Data structures (unchanged from original):
 *   levels[4][151] : 4 academic levels x 151 slots (prime capacity)
 *   IdMap           : student ID -> identifierIndex
 *   firstNameMap    : first name -> list of identifierIndex
 *   lastNameMap     : last name -> list of identifierIndex
 *   identifierIndex = slotIndex + numLevel * 10000
 *
 * Hashing : id % 151
 * Probing : quadratic with +/- i^2  (exactly as in original Collector)
 * Deletion: tombstone ("D") status
 */
@Component
public class Collector {

    private static final int CAPACITY = 151;
    private static final String[] LEVEL_NAMES = {"FR", "SO", "JR", "SR"};
    private static final String HASH_FUNCTION_DESC = "id % 151";

    // Core data structures -- exact same as original
    private Student[][] levels;
    private Map<String, ArrayList<Integer>> firstNameMap;
    private Map<String, ArrayList<Integer>> lastNameMap;
    private Map<Integer, Integer> IdMap;

    // Accumulated statistics
    private int totalCollisions;
    private int totalProbes;

    public Collector() {
        reset();
    }

    // ========================================================================
    //  RESET / INITIALIZE
    // ========================================================================

    /** Clear all data and re-initialize. */
    public synchronized void reset() {
        levels = new Student[4][CAPACITY];
        firstNameMap = new HashMap<>();
        lastNameMap = new HashMap<>();
        IdMap = new HashMap<>();
        totalCollisions = 0;
        totalProbes = 0;

        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < CAPACITY; j++) {
                levels[i][j] = new Student("E");
            }
        }
    }

    // ========================================================================
    //  CORE PROBING LOGIC  (preserved from original Collector EXACTLY)
    // ========================================================================

    /**
     * Original findNextAvailableSlot logic: quadratic probing with +/- i^2.
     * Checks (base + i^2) % cap first, then (base - i^2) % cap.
     * A slot is "available" if its status is NOT "O" (i.e. "E" or "D").
     */
    private int findNextAvailableSlot(int currentSlot, int levelNumber) {
        for (int i = 0; i <= (CAPACITY - 1) / 2; i++) {
            int temp = (currentSlot - i * i) % CAPACITY;
            if (temp < 0) temp = (temp + CAPACITY) % CAPACITY;
            if (!levels[levelNumber][(currentSlot + i * i) % CAPACITY].getStatus().equals("O")) {
                return (currentSlot + i * i) % CAPACITY;
            } else if (!levels[levelNumber][temp].getStatus().equals("O")) {
                return temp;
            }
        }
        return -1;
    }

    /**
     * Instrumented version of findNextAvailableSlot.
     * Returns the final slot AND a list of ProbeSteps for visualization.
     * The probing logic is byte-for-byte equivalent to the original.
     */
    private InstrumentedProbeResult findNextAvailableSlotInstrumented(int currentSlot, int levelNumber) {
        List<ProbeStep> steps = new ArrayList<>();
        int collisions = 0;
        int stepNumber = 0;

        for (int i = 0; i <= (CAPACITY - 1) / 2; i++) {
            // ---- PLUS direction: (base + i^2) % cap ----
            int plusSlot = (currentSlot + i * i) % CAPACITY;
            Student occupant = levels[levelNumber][plusSlot];
            String plusStatus = statusToDisplay(occupant.getStatus());
            boolean plusAvailable = !occupant.getStatus().equals("O");

            String plusFormula = "(" + currentSlot + " + " + i + "^2) % " + CAPACITY + " = " + plusSlot;
            String plusOccupantInfo = occupant.getStatus().equals("O")
                    ? "Student ID " + occupant.getId() : null;

            ProbeStep plusStep = new ProbeStep(stepNumber, plusSlot, plusFormula, plusStatus,
                    !plusAvailable, plusOccupantInfo);
            steps.add(plusStep);
            stepNumber++;

            if (plusAvailable) {
                return new InstrumentedProbeResult(plusSlot, steps, collisions);
            }
            collisions++;

            // ---- MINUS direction: (base - i^2) % cap (with wrap) ----
            int temp = (currentSlot - i * i) % CAPACITY;
            if (temp < 0) temp = (temp + CAPACITY) % CAPACITY;

            // Skip if same slot as plus (happens when i=0)
            if (temp == plusSlot) continue;

            Student minusOccupant = levels[levelNumber][temp];
            String minusStatus = statusToDisplay(minusOccupant.getStatus());
            boolean minusAvailable = !minusOccupant.getStatus().equals("O");

            String minusFormula = "(" + currentSlot + " - " + i + "^2) % " + CAPACITY + " = " + temp;
            String minusOccupantInfo = minusOccupant.getStatus().equals("O")
                    ? "Student ID " + minusOccupant.getId() : null;

            ProbeStep minusStep = new ProbeStep(stepNumber, temp, minusFormula, minusStatus,
                    !minusAvailable, minusOccupantInfo);
            steps.add(minusStep);
            stepNumber++;

            if (minusAvailable) {
                return new InstrumentedProbeResult(temp, steps, collisions);
            }
            collisions++;
        }

        return new InstrumentedProbeResult(-1, steps, collisions);
    }

    // ========================================================================
    //  ADD / INSERT  (original: downloadStudents + addNewStudent)
    // ========================================================================

    /**
     * Insert a single student. Returns an OperationTrace with full probing details.
     * Preserves original logic: hash -> probe -> place -> update all 3 indices.
     */
    public synchronized OperationTrace addNewStudent(StudentDTO dto) {
        long startTime = System.nanoTime();

        Student st = new Student(dto.getId(), dto.getLastName(), dto.getFirstName(),
                dto.getDateOfBirth(), dto.getUniversityLevel());

        int baseIndex = st.getId() % CAPACITY;

        OperationTrace trace = new OperationTrace();
        trace.setOperation("INSERT");
        trace.setHashFunction(HASH_FUNCTION_DESC);
        trace.setInputKey(st.getId());
        trace.setInputKeyString(String.valueOf(st.getId()));
        trace.setInitialHash(baseIndex);
        trace.setLevelIndex(st.getNumLevel());
        trace.setLevelName(st.getUniversityLevel());

        // Duplicate check
        if (IdMap.containsKey(st.getId())) {
            trace.setProbingSequence(Collections.emptyList());
            trace.setCollisionCount(0);
            trace.setProbeCount(0);
            trace.setFinalSlot(-1);
            trace.setIdentifierIndex(-1);
            trace.setSuccess(false);
            trace.setMessage("Duplicate ID: " + st.getId());
            trace.setDurationNanos(System.nanoTime() - startTime);
            return trace;
        }

        // Instrumented probing
        InstrumentedProbeResult probeResult = findNextAvailableSlotInstrumented(baseIndex, st.getNumLevel());
        int slot = probeResult.slot;

        trace.setProbingSequence(probeResult.steps);
        trace.setCollisionCount(probeResult.collisions);
        trace.setProbeCount(probeResult.steps.size());

        if (slot == -1) {
            trace.setFinalSlot(-1);
            trace.setIdentifierIndex(-1);
            trace.setSuccess(false);
            trace.setMessage("Table full for level " + st.getUniversityLevel());
            trace.setDurationNanos(System.nanoTime() - startTime);
            return trace;
        }

        // Place student (exactly as original)
        levels[st.getNumLevel()][slot] = st;

        // Compute identifierIndex (exactly as original: index + numLevel * 10000)
        int identifierIndex = slot + st.getNumLevel() * 10000;

        // Update index maps (exactly as original)
        IdMap.put(st.getId(), identifierIndex);

        if (firstNameMap.containsKey(st.getFirstName())) {
            firstNameMap.get(st.getFirstName()).add(identifierIndex);
        } else {
            ArrayList<Integer> temp = new ArrayList<>();
            temp.add(identifierIndex);
            firstNameMap.put(st.getFirstName(), temp);
        }

        if (lastNameMap.containsKey(st.getLastName())) {
            lastNameMap.get(st.getLastName()).add(identifierIndex);
        } else {
            ArrayList<Integer> temp = new ArrayList<>();
            temp.add(identifierIndex);
            lastNameMap.put(st.getLastName(), temp);
        }

        // Accumulate stats
        totalCollisions += probeResult.collisions;
        totalProbes += probeResult.steps.size();

        // Build trace
        trace.setFinalSlot(slot);
        trace.setIdentifierIndex(identifierIndex);
        trace.setSuccess(true);
        trace.setMessage("Inserted at slot " + slot + " in level " + st.getUniversityLevel());
        trace.setResult(toDTO(st));

        Map<String, Object> indexUpdates = new LinkedHashMap<>();
        indexUpdates.put("IdMap", Map.of("key", st.getId(), "value", identifierIndex));
        indexUpdates.put("firstNameMap", Map.of("key", st.getFirstName(), "addedIndex", identifierIndex));
        indexUpdates.put("lastNameMap", Map.of("key", st.getLastName(), "addedIndex", identifierIndex));
        trace.setIndexUpdates(indexUpdates);

        trace.setDurationNanos(System.nanoTime() - startTime);
        return trace;
    }

    // ========================================================================
    //  SEARCH BY ID  (original: searchByID)
    // ========================================================================

    /**
     * Search using the IdMap index. O(1) lookup.
     * Also generates a probe visualization showing where the student actually sits.
     */
    public synchronized OperationTrace searchByID(int id) {
        long startTime = System.nanoTime();

        int baseIndex = id % CAPACITY;

        OperationTrace trace = new OperationTrace();
        trace.setOperation("SEARCH_BY_ID");
        trace.setHashFunction(HASH_FUNCTION_DESC);
        trace.setInputKey(id);
        trace.setInputKeyString(String.valueOf(id));
        trace.setInitialHash(baseIndex);

        if (!IdMap.containsKey(id)) {
            trace.setProbingSequence(Collections.emptyList());
            trace.setCollisionCount(0);
            trace.setProbeCount(0);
            trace.setFinalSlot(-1);
            trace.setLevelIndex(-1);
            trace.setLevelName("N/A");
            trace.setIdentifierIndex(-1);
            trace.setSuccess(false);
            trace.setMessage("Student with ID " + id + " not found");
            trace.setDurationNanos(System.nanoTime() - startTime);
            return trace;
        }

        int identifierIndex = IdMap.get(id);
        int level = identifierIndex / 10000;
        int slot = identifierIndex % 10000;
        Student s = levels[level][slot];

        // Build probe visualization: show the path from hash to actual slot
        List<ProbeStep> probeVisualization = buildSearchProbeVisualization(baseIndex, level, slot);

        trace.setProbingSequence(probeVisualization);
        trace.setCollisionCount(probeVisualization.size() - 1);
        trace.setProbeCount(probeVisualization.size());
        trace.setFinalSlot(slot);
        trace.setLevelIndex(level);
        trace.setLevelName(LEVEL_NAMES[level]);
        trace.setIdentifierIndex(identifierIndex);
        trace.setSuccess(true);
        trace.setMessage("Found via IdMap lookup");
        trace.setResult(toDTO(s));

        Map<String, Object> indexUpdates = new LinkedHashMap<>();
        indexUpdates.put("indexUsed", "IdMap");
        indexUpdates.put("lookupKey", id);
        indexUpdates.put("identifierIndex", identifierIndex);
        indexUpdates.put("decodedLevel", level);
        indexUpdates.put("decodedSlot", slot);
        trace.setIndexUpdates(indexUpdates);

        trace.setDurationNanos(System.nanoTime() - startTime);
        return trace;
    }

    // ========================================================================
    //  SEARCH BY FIRST NAME  (original: searchByFirstName)
    // ========================================================================

    public synchronized OperationTrace searchByFirstName(String firstName) {
        long startTime = System.nanoTime();

        OperationTrace trace = new OperationTrace();
        trace.setOperation("SEARCH_BY_FIRST_NAME");
        trace.setHashFunction("HashMap lookup on firstNameMap");
        trace.setInputKeyString(firstName);
        trace.setInitialHash(-1);

        if (!firstNameMap.containsKey(firstName)) {
            trace.setProbingSequence(Collections.emptyList());
            trace.setCollisionCount(0);
            trace.setProbeCount(0);
            trace.setFinalSlot(-1);
            trace.setLevelIndex(-1);
            trace.setLevelName("N/A");
            trace.setIdentifierIndex(-1);
            trace.setSuccess(false);
            trace.setMessage("No students found with first name: " + firstName);
            trace.setDurationNanos(System.nanoTime() - startTime);
            return trace;
        }

        ArrayList<Integer> indices = firstNameMap.get(firstName);
        List<StudentDTO> results = new ArrayList<>();
        for (int index : indices) {
            int level = index / 10000;
            int slot = index % 10000;
            Student s = levels[level][slot];
            if (s.getStatus().equals("O")) {
                results.add(toDTO(s));
            }
        }

        trace.setProbingSequence(Collections.emptyList());
        trace.setCollisionCount(0);
        trace.setProbeCount(1); // single hash map lookup
        trace.setSuccess(!results.isEmpty());
        trace.setMessage("Found " + results.size() + " student(s) with first name: " + firstName);
        trace.setResults(results);

        if (!results.isEmpty()) {
            int firstIdx = indices.get(0);
            trace.setFinalSlot(firstIdx % 10000);
            trace.setLevelIndex(firstIdx / 10000);
            trace.setLevelName(LEVEL_NAMES[firstIdx / 10000]);
            trace.setIdentifierIndex(firstIdx);
            trace.setResult(results.get(0));
        } else {
            trace.setFinalSlot(-1);
            trace.setLevelIndex(-1);
            trace.setLevelName("N/A");
            trace.setIdentifierIndex(-1);
        }

        Map<String, Object> indexUpdates = new LinkedHashMap<>();
        indexUpdates.put("indexUsed", "firstNameMap");
        indexUpdates.put("lookupKey", firstName);
        indexUpdates.put("matchCount", results.size());
        List<Map<String, Object>> matchDetails = new ArrayList<>();
        for (int idx : indices) {
            int lv = idx / 10000;
            int sl = idx % 10000;
            Student st = levels[lv][sl];
            if (st.getStatus().equals("O")) {
                matchDetails.add(Map.of(
                        "identifierIndex", idx,
                        "level", lv,
                        "slot", sl,
                        "studentId", st.getId()
                ));
            }
        }
        indexUpdates.put("matches", matchDetails);
        trace.setIndexUpdates(indexUpdates);

        trace.setDurationNanos(System.nanoTime() - startTime);
        return trace;
    }

    // ========================================================================
    //  SEARCH BY LAST NAME  (original: searchByLastName)
    // ========================================================================

    public synchronized OperationTrace searchByLastName(String lastName) {
        long startTime = System.nanoTime();

        OperationTrace trace = new OperationTrace();
        trace.setOperation("SEARCH_BY_LAST_NAME");
        trace.setHashFunction("HashMap lookup on lastNameMap");
        trace.setInputKeyString(lastName);
        trace.setInitialHash(-1);

        if (!lastNameMap.containsKey(lastName)) {
            trace.setProbingSequence(Collections.emptyList());
            trace.setCollisionCount(0);
            trace.setProbeCount(0);
            trace.setFinalSlot(-1);
            trace.setLevelIndex(-1);
            trace.setLevelName("N/A");
            trace.setIdentifierIndex(-1);
            trace.setSuccess(false);
            trace.setMessage("No students found with last name: " + lastName);
            trace.setDurationNanos(System.nanoTime() - startTime);
            return trace;
        }

        ArrayList<Integer> indices = lastNameMap.get(lastName);
        List<StudentDTO> results = new ArrayList<>();
        for (int index : indices) {
            int level = index / 10000;
            int slot = index % 10000;
            Student s = levels[level][slot];
            if (s.getStatus().equals("O")) {
                results.add(toDTO(s));
            }
        }

        trace.setProbingSequence(Collections.emptyList());
        trace.setCollisionCount(0);
        trace.setProbeCount(1);
        trace.setSuccess(!results.isEmpty());
        trace.setMessage("Found " + results.size() + " student(s) with last name: " + lastName);
        trace.setResults(results);

        if (!results.isEmpty()) {
            int firstIdx = indices.get(0);
            trace.setFinalSlot(firstIdx % 10000);
            trace.setLevelIndex(firstIdx / 10000);
            trace.setLevelName(LEVEL_NAMES[firstIdx / 10000]);
            trace.setIdentifierIndex(firstIdx);
            trace.setResult(results.get(0));
        } else {
            trace.setFinalSlot(-1);
            trace.setLevelIndex(-1);
            trace.setLevelName("N/A");
            trace.setIdentifierIndex(-1);
        }

        Map<String, Object> indexUpdates = new LinkedHashMap<>();
        indexUpdates.put("indexUsed", "lastNameMap");
        indexUpdates.put("lookupKey", lastName);
        indexUpdates.put("matchCount", results.size());
        List<Map<String, Object>> matchDetails = new ArrayList<>();
        for (int idx : indices) {
            int lv = idx / 10000;
            int sl = idx % 10000;
            Student st = levels[lv][sl];
            if (st.getStatus().equals("O")) {
                matchDetails.add(Map.of(
                        "identifierIndex", idx,
                        "level", lv,
                        "slot", sl,
                        "studentId", st.getId()
                ));
            }
        }
        indexUpdates.put("matches", matchDetails);
        trace.setIndexUpdates(indexUpdates);

        trace.setDurationNanos(System.nanoTime() - startTime);
        return trace;
    }

    // ========================================================================
    //  DELETE  (original: deleteStudent)
    // ========================================================================

    /**
     * Delete using tombstone. Preserves original logic exactly:
     * - Mark slot status as "D"
     * - Remove from all three index maps
     */
    public synchronized OperationTrace deleteStudent(int id) {
        long startTime = System.nanoTime();

        OperationTrace trace = new OperationTrace();
        trace.setOperation("DELETE");
        trace.setHashFunction(HASH_FUNCTION_DESC);
        trace.setInputKey(id);
        trace.setInputKeyString(String.valueOf(id));
        trace.setInitialHash(id % CAPACITY);

        if (!IdMap.containsKey(id)) {
            trace.setProbingSequence(Collections.emptyList());
            trace.setCollisionCount(0);
            trace.setProbeCount(0);
            trace.setFinalSlot(-1);
            trace.setLevelIndex(-1);
            trace.setLevelName("N/A");
            trace.setIdentifierIndex(-1);
            trace.setSuccess(false);
            trace.setMessage("Student with ID " + id + " not found");
            trace.setDurationNanos(System.nanoTime() - startTime);
            return trace;
        }

        int identifierIndex = IdMap.get(id);
        int level = identifierIndex / 10000;
        int slot = identifierIndex % 10000;
        Student stu = levels[level][slot];

        trace.setResult(toDTO(stu));
        trace.setFinalSlot(slot);
        trace.setLevelIndex(level);
        trace.setLevelName(LEVEL_NAMES[level]);
        trace.setIdentifierIndex(identifierIndex);
        trace.setProbingSequence(Collections.emptyList());
        trace.setCollisionCount(0);
        trace.setProbeCount(1);

        // Tombstone deletion -- exactly as original
        levels[level][slot].setStatus("D");

        // Remove from index maps -- exactly as original
        firstNameMap.get(stu.getFirstName()).remove((Integer) identifierIndex);
        if (firstNameMap.get(stu.getFirstName()).isEmpty()) {
            firstNameMap.remove(stu.getFirstName());
        }

        lastNameMap.get(stu.getLastName()).remove((Integer) identifierIndex);
        if (lastNameMap.get(stu.getLastName()).isEmpty()) {
            lastNameMap.remove(stu.getLastName());
        }

        IdMap.remove(id);

        // Trace the index updates
        Map<String, Object> indexUpdates = new LinkedHashMap<>();
        indexUpdates.put("IdMap", Map.of("removed", id));
        indexUpdates.put("firstNameMap", Map.of("key", stu.getFirstName(), "removedIndex", identifierIndex));
        indexUpdates.put("lastNameMap", Map.of("key", stu.getLastName(), "removedIndex", identifierIndex));
        indexUpdates.put("slotMarkedAs", "D");
        trace.setIndexUpdates(indexUpdates);

        trace.setSuccess(true);
        trace.setMessage("Deleted student " + id + " from slot " + slot + " in level " + LEVEL_NAMES[level]);
        trace.setDurationNanos(System.nanoTime() - startTime);
        return trace;
    }

    // ========================================================================
    //  EDIT / UPDATE  (original: editStudent)
    // ========================================================================

    /**
     * Edit a student field. Preserves original editStudent logic:
     *   dataNum 1 = lastName, 2 = firstName, 3 = dateOfBirth,
     *   4 = universityLevel (delete + re-insert).
     *
     * This version accepts field name strings instead of dataNum for API clarity.
     */
    public synchronized OperationTrace editStudent(int id, String field, String newValue) {
        long startTime = System.nanoTime();

        OperationTrace trace = new OperationTrace();
        trace.setOperation("UPDATE");
        trace.setHashFunction(HASH_FUNCTION_DESC);
        trace.setInputKey(id);
        trace.setInputKeyString(String.valueOf(id));
        trace.setInitialHash(id % CAPACITY);

        if (!IdMap.containsKey(id)) {
            trace.setProbingSequence(Collections.emptyList());
            trace.setCollisionCount(0);
            trace.setProbeCount(0);
            trace.setFinalSlot(-1);
            trace.setLevelIndex(-1);
            trace.setLevelName("N/A");
            trace.setIdentifierIndex(-1);
            trace.setSuccess(false);
            trace.setMessage("Student with ID " + id + " not found");
            trace.setDurationNanos(System.nanoTime() - startTime);
            return trace;
        }

        int identifierIndex = IdMap.get(id);
        int level = identifierIndex / 10000;
        int slot = identifierIndex % 10000;
        Student stu = levels[level][slot];

        Map<String, Object> indexUpdates = new LinkedHashMap<>();

        switch (field) {
            case "lastName" -> {
                // Original editStudent dataNum == 1
                String oldName = stu.getLastName();
                lastNameMap.get(oldName).remove((Integer) identifierIndex);
                if (lastNameMap.get(oldName).isEmpty()) lastNameMap.remove(oldName);

                levels[level][slot].setLastName(newValue);

                if (lastNameMap.containsKey(newValue)) {
                    lastNameMap.get(newValue).add(identifierIndex);
                } else {
                    ArrayList<Integer> temp = new ArrayList<>();
                    temp.add(identifierIndex);
                    lastNameMap.put(newValue, temp);
                }

                indexUpdates.put("lastNameMap", Map.of(
                        "removedFrom", oldName, "addedTo", newValue, "identifierIndex", identifierIndex));
            }
            case "firstName" -> {
                // Original editStudent dataNum == 2
                String oldName = stu.getFirstName();
                firstNameMap.get(oldName).remove((Integer) identifierIndex);
                if (firstNameMap.get(oldName).isEmpty()) firstNameMap.remove(oldName);

                levels[level][slot].setFirstName(newValue);

                if (firstNameMap.containsKey(newValue)) {
                    firstNameMap.get(newValue).add(identifierIndex);
                } else {
                    ArrayList<Integer> temp = new ArrayList<>();
                    temp.add(identifierIndex);
                    firstNameMap.put(newValue, temp);
                }

                indexUpdates.put("firstNameMap", Map.of(
                        "removedFrom", oldName, "addedTo", newValue, "identifierIndex", identifierIndex));
            }
            case "dateOfBirth" -> {
                // Original editStudent dataNum == 3
                levels[level][slot].setDateOfBirth(newValue);
                indexUpdates.put("dateOfBirth", Map.of("updated", newValue));
            }
            case "universityLevel" -> {
                // Original editStudent dataNum == 4: delete + re-insert
                StudentDTO tempDto = new StudentDTO(stu.getId(), stu.getFirstName(),
                        stu.getLastName(), stu.getDateOfBirth(), newValue);

                // Delete old
                deleteStudent(stu.getId());
                // Insert new
                OperationTrace insertTrace = addNewStudent(tempDto);

                // Merge insert trace info
                trace.setProbingSequence(insertTrace.getProbingSequence());
                trace.setCollisionCount(insertTrace.getCollisionCount());
                trace.setProbeCount(insertTrace.getProbeCount());
                trace.setFinalSlot(insertTrace.getFinalSlot());
                trace.setLevelIndex(insertTrace.getLevelIndex());
                trace.setLevelName(insertTrace.getLevelName());
                trace.setIdentifierIndex(insertTrace.getIdentifierIndex());
                trace.setResult(insertTrace.getResult());
                trace.setSuccess(insertTrace.isSuccess());
                trace.setMessage("Level changed: deleted from " + LEVEL_NAMES[level] +
                        " and re-inserted into " + newValue);

                indexUpdates.put("levelChange", Map.of(
                        "from", LEVEL_NAMES[level], "to", newValue,
                        "oldSlot", slot, "newSlot", insertTrace.getFinalSlot(),
                        "oldIdentifierIndex", identifierIndex,
                        "newIdentifierIndex", insertTrace.getIdentifierIndex()));
                trace.setIndexUpdates(indexUpdates);
                trace.setDurationNanos(System.nanoTime() - startTime);
                return trace;
            }
            default -> {
                trace.setSuccess(false);
                trace.setMessage("Unknown field: " + field);
                trace.setDurationNanos(System.nanoTime() - startTime);
                return trace;
            }
        }

        // For non-level changes, just report the updated student
        trace.setProbingSequence(Collections.emptyList());
        trace.setCollisionCount(0);
        trace.setProbeCount(1);
        trace.setFinalSlot(slot);
        trace.setLevelIndex(level);
        trace.setLevelName(LEVEL_NAMES[level]);
        trace.setIdentifierIndex(identifierIndex);
        trace.setResult(toDTO(levels[level][slot]));
        trace.setIndexUpdates(indexUpdates);
        trace.setSuccess(true);
        trace.setMessage("Updated " + field + " to '" + newValue + "'");
        trace.setDurationNanos(System.nanoTime() - startTime);
        return trace;
    }

    // ========================================================================
    //  SHOW STUDENTS BY LEVEL  (original: showStudentsInAcademicLevel)
    // ========================================================================

    public synchronized List<StudentDTO> getStudentsByLevel(String levelName) {
        int wantedLevel = levelNameToIndex(levelName);
        List<StudentDTO> result = new ArrayList<>();
        if (wantedLevel == -1) return result;
        for (int i = 0; i < CAPACITY; i++) {
            Student st = levels[wantedLevel][i];
            if (st != null && st.getStatus().equals("O")) {
                result.add(toDTO(st));
            }
        }
        return result;
    }

    // ========================================================================
    //  GET ALL STUDENTS
    // ========================================================================

    public synchronized List<StudentDTO> getAllStudents() {
        List<StudentDTO> students = new ArrayList<>();
        for (int lv = 0; lv < 4; lv++) {
            for (int sl = 0; sl < CAPACITY; sl++) {
                if (levels[lv][sl].getStatus().equals("O")) {
                    students.add(toDTO(levels[lv][sl]));
                }
            }
        }
        return students;
    }

    // ========================================================================
    //  HASH TABLE STATE  (for visualization)
    // ========================================================================

    public synchronized HashTableState getHashTableState() {
        List<LevelState> levelStates = new ArrayList<>();
        for (int lv = 0; lv < 4; lv++) {
            LevelState ls = new LevelState();
            ls.setLevelName(LEVEL_NAMES[lv]);
            ls.setLevelIndex(lv);

            List<SlotState> slots = new ArrayList<>(CAPACITY);
            int occupied = 0, deleted = 0, empty = 0;

            for (int sl = 0; sl < CAPACITY; sl++) {
                Student s = levels[lv][sl];
                SlotState ss = new SlotState();
                ss.setIndex(sl);
                ss.setStatus(s.getStatus());

                if (s.getStatus().equals("O")) {
                    ss.setStudent(toDTO(s));
                    ss.setNaturalHash(s.getId() % CAPACITY);
                    ss.setIsDisplaced(s.getId() % CAPACITY != sl);
                    occupied++;
                } else if (s.getStatus().equals("D")) {
                    ss.setNaturalHash(-1);
                    ss.setIsDisplaced(false);
                    deleted++;
                } else {
                    ss.setNaturalHash(-1);
                    ss.setIsDisplaced(false);
                    empty++;
                }
                slots.add(ss);
            }

            ls.setSlots(slots);
            ls.setOccupiedCount(occupied);
            ls.setDeletedCount(deleted);
            ls.setEmptyCount(empty);
            ls.setLoadFactor(Math.round((double) occupied / CAPACITY * 10000.0) / 10000.0);
            levelStates.add(ls);
        }

        return new HashTableState(CAPACITY, levelStates);
    }

    // ========================================================================
    //  ENGINE STATS
    // ========================================================================

    public synchronized EngineStats getStats() {
        EngineStats stats = new EngineStats();
        stats.setCapacity(CAPACITY);
        stats.setTotalSlots(4 * CAPACITY);

        int total = 0;
        int tombstones = 0;
        Map<String, Integer> perLevel = new LinkedHashMap<>();
        Map<String, Double> loadPerLevel = new LinkedHashMap<>();

        for (int lv = 0; lv < 4; lv++) {
            int occupied = 0;
            for (int sl = 0; sl < CAPACITY; sl++) {
                if (levels[lv][sl].getStatus().equals("O")) occupied++;
                else if (levels[lv][sl].getStatus().equals("D")) tombstones++;
            }
            total += occupied;
            perLevel.put(LEVEL_NAMES[lv], occupied);
            loadPerLevel.put(LEVEL_NAMES[lv], Math.round((double) occupied / CAPACITY * 10000.0) / 10000.0);
        }

        stats.setTotalStudents(total);
        stats.setStudentsPerLevel(perLevel);
        stats.setLoadFactorPerLevel(loadPerLevel);
        stats.setOverallLoadFactor(Math.round((double) total / (4 * CAPACITY) * 10000.0) / 10000.0);
        stats.setTotalCollisions(totalCollisions);
        stats.setTotalProbes(totalProbes);
        stats.setIdIndexSize(IdMap.size());
        stats.setFirstNameIndexSize(firstNameMap.size());
        stats.setLastNameIndexSize(lastNameMap.size());
        stats.setTombstoneCount(tombstones);

        return stats;
    }

    // ========================================================================
    //  SAMPLE DATA LOADING
    // ========================================================================

    /**
     * Load sample data from the bundled CSV on the classpath.
     * Returns a list of traces, one per inserted student.
     */
    public synchronized List<OperationTrace> loadSampleData() {
        List<OperationTrace> traces = new ArrayList<>();
        try {
            ClassPathResource resource = new ClassPathResource("students_details.csv");
            try (BufferedReader br = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
                String header = br.readLine(); // skip header
                String line;
                while ((line = br.readLine()) != null) {
                    String[] parts = line.split(",");
                    if (parts.length < 5) continue;
                    try {
                        int id = Integer.parseInt(parts[0].trim());
                        String lastName = parts[1].trim();
                        String firstName = parts[2].trim();
                        String dob = parts[3].trim();
                        String level = parts[4].trim();

                        StudentDTO dto = new StudentDTO(id, firstName, lastName, dob, level);
                        OperationTrace trace = addNewStudent(dto);
                        traces.add(trace);
                    } catch (NumberFormatException e) {
                        // skip malformed rows
                    }
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to load sample data: " + e.getMessage(), e);
        }
        return traces;
    }

    /**
     * Batch-insert a list of students with traces.
     */
    public synchronized List<OperationTrace> loadSampleData(List<StudentDTO> students) {
        List<OperationTrace> traces = new ArrayList<>();
        for (StudentDTO dto : students) {
            traces.add(addNewStudent(dto));
        }
        return traces;
    }

    // ========================================================================
    //  CSV IMPORT
    // ========================================================================

    /**
     * Import students from raw CSV content string.
     */
    public synchronized List<OperationTrace> importCsv(String csvContent) {
        List<OperationTrace> traces = new ArrayList<>();
        String[] lines = csvContent.split("\\r?\\n");
        boolean headerSkipped = false;

        for (String line : lines) {
            if (!headerSkipped) {
                headerSkipped = true;
                // Check if first line is header
                if (line.toLowerCase().contains("id") || line.toLowerCase().contains("name")) {
                    continue;
                }
            }
            String[] parts = line.split(",");
            if (parts.length < 5) continue;
            try {
                int id = Integer.parseInt(parts[0].trim());
                String lastName = parts[1].trim();
                String firstName = parts[2].trim();
                String dob = parts[3].trim();
                String level = parts[4].trim();

                StudentDTO dto = new StudentDTO(id, firstName, lastName, dob, level);
                traces.add(addNewStudent(dto));
            } catch (NumberFormatException e) {
                // skip malformed rows
            }
        }
        return traces;
    }

    // ========================================================================
    //  NAIVE LINEAR SEARCH  (for performance comparison)
    // ========================================================================

    /**
     * Iterate through ALL slots across ALL levels looking for a student by ID.
     * Returns [stepsRequired, timeNanos].
     */
    public synchronized long[] linearSearchById(int id) {
        long startTime = System.nanoTime();
        int steps = 0;
        for (int lv = 0; lv < 4; lv++) {
            for (int sl = 0; sl < CAPACITY; sl++) {
                steps++;
                if (levels[lv][sl].getStatus().equals("O") && levels[lv][sl].getId() == id) {
                    long elapsed = System.nanoTime() - startTime;
                    return new long[]{steps, elapsed};
                }
            }
        }
        long elapsed = System.nanoTime() - startTime;
        return new long[]{steps, elapsed};
    }

    /**
     * Naive linear search for first name -- scan all slots.
     */
    public synchronized long[] linearSearchByFirstName(String firstName) {
        long startTime = System.nanoTime();
        int steps = 0;
        int found = 0;
        for (int lv = 0; lv < 4; lv++) {
            for (int sl = 0; sl < CAPACITY; sl++) {
                steps++;
                if (levels[lv][sl].getStatus().equals("O")
                        && levels[lv][sl].getFirstName().equals(firstName)) {
                    found++;
                }
            }
        }
        long elapsed = System.nanoTime() - startTime;
        return new long[]{steps, elapsed, found};
    }

    /**
     * Naive linear search for last name -- scan all slots.
     */
    public synchronized long[] linearSearchByLastName(String lastName) {
        long startTime = System.nanoTime();
        int steps = 0;
        int found = 0;
        for (int lv = 0; lv < 4; lv++) {
            for (int sl = 0; sl < CAPACITY; sl++) {
                steps++;
                if (levels[lv][sl].getStatus().equals("O")
                        && levels[lv][sl].getLastName().equals(lastName)) {
                    found++;
                }
            }
        }
        long elapsed = System.nanoTime() - startTime;
        return new long[]{steps, elapsed, found};
    }

    // ========================================================================
    //  PERFORMANCE COMPARISON
    // ========================================================================

    public synchronized PerformanceComparison comparePerformance(String type, String key) {
        PerformanceComparison comparison = new PerformanceComparison();
        comparison.setSearchType(type);
        comparison.setSearchKey(key);

        switch (type) {
            case "id" -> {
                int id;
                try {
                    id = Integer.parseInt(key);
                } catch (NumberFormatException e) {
                    comparison.setIndexUsed("IdMap");
                    comparison.setIndexedSteps(0);
                    comparison.setLinearSteps(0);
                    comparison.setSpeedupFactor(0);
                    return comparison;
                }

                // Indexed search
                long indexStart = System.nanoTime();
                OperationTrace indexedTrace = searchByID(id);
                long indexTime = System.nanoTime() - indexStart;
                int indexedSteps = indexedTrace.isSuccess() ? 1 : 0; // O(1) IdMap lookup

                // Linear search
                long[] linearResult = linearSearchById(id);

                comparison.setIndexUsed("IdMap");
                comparison.setIndexedSteps(indexedSteps);
                comparison.setIndexedTimeNanos(indexTime);
                comparison.setLinearSteps((int) linearResult[0]);
                comparison.setLinearTimeNanos(linearResult[1]);
                comparison.setSpeedupFactor(indexedSteps > 0
                        ? Math.round((double) linearResult[0] / indexedSteps * 100.0) / 100.0 : 0);

                comparison.setIndexedPath(List.of(
                        "Lookup IdMap[" + id + "]",
                        "Get identifierIndex = " + (IdMap.containsKey(id) ? IdMap.get(id) : "NOT_FOUND"),
                        "Decode: level = " + (IdMap.containsKey(id) ? IdMap.get(id) / 10000 : "N/A")
                                + ", slot = " + (IdMap.containsKey(id) ? IdMap.get(id) % 10000 : "N/A"),
                        "Direct array access: levels[level][slot]"
                ));
                comparison.setLinearPath(List.of(
                        "Start at levels[0][0]",
                        "Check each slot sequentially",
                        "Total slots checked: " + linearResult[0],
                        linearResult[0] < 4 * CAPACITY ? "Found at step " + linearResult[0] : "Not found after checking all " + (4 * CAPACITY) + " slots"
                ));
            }
            case "firstName" -> {
                // Indexed search
                long indexStart = System.nanoTime();
                OperationTrace indexedTrace = searchByFirstName(key);
                long indexTime = System.nanoTime() - indexStart;
                int indexedSteps = indexedTrace.isSuccess() ? 1 : 0;

                // Linear search
                long[] linearResult = linearSearchByFirstName(key);

                comparison.setIndexUsed("firstNameMap");
                comparison.setIndexedSteps(indexedSteps);
                comparison.setIndexedTimeNanos(indexTime);
                comparison.setLinearSteps((int) linearResult[0]);
                comparison.setLinearTimeNanos(linearResult[1]);
                comparison.setSpeedupFactor(indexedSteps > 0
                        ? Math.round((double) linearResult[0] / indexedSteps * 100.0) / 100.0 : 0);

                comparison.setIndexedPath(List.of(
                        "Lookup firstNameMap[\"" + key + "\"]",
                        "Get list of identifierIndices",
                        "Decode each: level and slot from identifierIndex",
                        "Direct array access for each match"
                ));
                comparison.setLinearPath(List.of(
                        "Start at levels[0][0]",
                        "Check each slot's firstName field",
                        "Total slots checked: " + linearResult[0],
                        "Found " + linearResult[2] + " matches"
                ));
            }
            case "lastName" -> {
                // Indexed search
                long indexStart = System.nanoTime();
                OperationTrace indexedTrace = searchByLastName(key);
                long indexTime = System.nanoTime() - indexStart;
                int indexedSteps = indexedTrace.isSuccess() ? 1 : 0;

                // Linear search
                long[] linearResult = linearSearchByLastName(key);

                comparison.setIndexUsed("lastNameMap");
                comparison.setIndexedSteps(indexedSteps);
                comparison.setIndexedTimeNanos(indexTime);
                comparison.setLinearSteps((int) linearResult[0]);
                comparison.setLinearTimeNanos(linearResult[1]);
                comparison.setSpeedupFactor(indexedSteps > 0
                        ? Math.round((double) linearResult[0] / indexedSteps * 100.0) / 100.0 : 0);

                comparison.setIndexedPath(List.of(
                        "Lookup lastNameMap[\"" + key + "\"]",
                        "Get list of identifierIndices",
                        "Decode each: level and slot from identifierIndex",
                        "Direct array access for each match"
                ));
                comparison.setLinearPath(List.of(
                        "Start at levels[0][0]",
                        "Check each slot's lastName field",
                        "Total slots checked: " + linearResult[0],
                        "Found " + linearResult[2] + " matches"
                ));
            }
        }

        return comparison;
    }

    // ========================================================================
    //  UTILITY
    // ========================================================================

    public boolean containsId(int id) {
        return IdMap.containsKey(id);
    }

    public int getCapacity() {
        return CAPACITY;
    }

    public int getTotalStudentCount() {
        return IdMap.size();
    }

    public static int levelNameToIndex(String levelName) {
        return switch (levelName.toUpperCase()) {
            case "FR" -> 0;
            case "SO" -> 1;
            case "JR" -> 2;
            case "SR" -> 3;
            default -> -1;
        };
    }

    public static String indexToLevelName(int index) {
        if (index >= 0 && index <= 3) return LEVEL_NAMES[index];
        return "UNKNOWN";
    }

    private String statusToDisplay(String status) {
        return switch (status) {
            case "E" -> "EMPTY";
            case "O" -> "OCCUPIED";
            case "D" -> "DELETED";
            default -> status;
        };
    }

    private StudentDTO toDTO(Student s) {
        return new StudentDTO(s.getId(), s.getFirstName(), s.getLastName(),
                s.getDateOfBirth(), s.getUniversityLevel());
    }

    /**
     * Build a probe visualization showing the path from the initial hash to the actual slot
     * where the student is located. This helps visualize displacement/collisions.
     */
    private List<ProbeStep> buildSearchProbeVisualization(int baseIndex, int level, int targetSlot) {
        List<ProbeStep> steps = new ArrayList<>();
        int stepNumber = 0;

        for (int i = 0; i <= (CAPACITY - 1) / 2; i++) {
            // Plus direction
            int plusSlot = (baseIndex + i * i) % CAPACITY;
            Student occupant = levels[level][plusSlot];
            String plusFormula = "(" + baseIndex + " + " + i + "^2) % " + CAPACITY + " = " + plusSlot;
            String plusStatus = statusToDisplay(occupant.getStatus());
            String plusOccupantInfo = occupant.getStatus().equals("O")
                    ? "Student ID " + occupant.getId() : null;

            boolean isTarget = plusSlot == targetSlot;
            ProbeStep plusStep = new ProbeStep(stepNumber, plusSlot, plusFormula, plusStatus,
                    !isTarget && occupant.getStatus().equals("O"), plusOccupantInfo);
            steps.add(plusStep);
            stepNumber++;

            if (isTarget) return steps;

            // Minus direction
            int temp = (baseIndex - i * i) % CAPACITY;
            if (temp < 0) temp = (temp + CAPACITY) % CAPACITY;

            if (temp != plusSlot) {
                Student minusOccupant = levels[level][temp];
                String minusFormula = "(" + baseIndex + " - " + i + "^2) % " + CAPACITY + " = " + temp;
                String minusStatus = statusToDisplay(minusOccupant.getStatus());
                String minusOccupantInfo = minusOccupant.getStatus().equals("O")
                        ? "Student ID " + minusOccupant.getId() : null;

                boolean isTargetMinus = temp == targetSlot;
                ProbeStep minusStep = new ProbeStep(stepNumber, temp, minusFormula, minusStatus,
                        !isTargetMinus && minusOccupant.getStatus().equals("O"), minusOccupantInfo);
                steps.add(minusStep);
                stepNumber++;

                if (isTargetMinus) return steps;
            }
        }

        return steps;
    }

    // ========================================================================
    //  INNER CLASS
    // ========================================================================

    private static class InstrumentedProbeResult {
        final int slot;
        final List<ProbeStep> steps;
        final int collisions;

        InstrumentedProbeResult(int slot, List<ProbeStep> steps, int collisions) {
            this.slot = slot;
            this.steps = steps;
            this.collisions = collisions;
        }
    }
}
