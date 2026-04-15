# Multi-Index Hash Engine — Algorithm Visualization Platform

A full-stack web application that transforms a custom multi-index hash table engine into an interactive algorithm visualization platform. Built for ICS202 Data Structures at KFUPM.

> **This is not a standard CRUD app.** The entire system is powered by a custom-built indexing engine using quadratic probing, multi-index hash maps, and a 2D partitioned hash table — all preserved from the original Java implementation and exposed through rich API traces and animated frontend visualizations.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Indexing Engine](#core-indexing-engine)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Complexity Analysis](#complexity-analysis)

---

## Overview

### What This Project Does

1. **Stores student records** in a 2D hash table (`Student[4][151]`) partitioned by academic level (FR, SO, JR, SR)
2. **Indexes every record** through three parallel access paths:
   - `IdMap` — O(1) lookup by student ID
   - `firstNameMap` — O(1) lookup by first name (returns all matches)
   - `lastNameMap` — O(1) lookup by last name (returns all matches)
3. **Resolves collisions** using bidirectional quadratic probing (`+i²` and `-i²`)
4. **Visualizes every operation** step-by-step: hash computation, probing path, collision detection, slot placement, and index updates
5. **Compares performance** of indexed O(1) retrieval versus naive O(n) linear scan with real-time benchmarks

### Why Multi-Indexing Matters

In real-world systems, data is accessed through different fields — sometimes by ID, sometimes by name. A single hash function can only optimize for one access path. This engine maintains **three synchronized indices** so that every field provides O(1) retrieval without database infrastructure.

---

## Architecture

```
┌──────────────────────────┐         ┌──────────────────────────┐
│     React Frontend       │  HTTP   │    Spring Boot Backend   │
│                          │ ◄─────► │                          │
│  Vite + Tailwind CSS     │  JSON   │  REST API + Validation   │
│  Framer Motion + Recharts│         │                          │
└──────────────────────────┘         └────────────┬─────────────┘
                                                  │
                                                  ▼
                                     ┌──────────────────────────┐
                                     │    Indexing Engine        │
                                     │    (Collector.java)       │
                                     │                          │
                                     │  Student[4][151]         │
                                     │  IdMap (HashMap)         │
                                     │  firstNameMap (HashMap)  │
                                     │  lastNameMap (HashMap)   │
                                     └──────────────────────────┘
```

**Data flow**: Every API request (add, search, delete, edit) passes through the Collector engine. The engine performs the hash table operation, records a detailed **OperationTrace** (hash value, probing steps, collisions, index changes), and returns both the result and the trace. The frontend uses the trace to animate the operation step-by-step.

---

## Core Indexing Engine

### Hash Table Structure

```
levels[0] = FR:  [ slot_0 ] [ slot_1 ] [ slot_2 ] ... [ slot_150 ]
levels[1] = SO:  [ slot_0 ] [ slot_1 ] [ slot_2 ] ... [ slot_150 ]
levels[2] = JR:  [ slot_0 ] [ slot_1 ] [ slot_2 ] ... [ slot_150 ]
levels[3] = SR:  [ slot_0 ] [ slot_1 ] [ slot_2 ] ... [ slot_150 ]
```

- **Capacity**: 151 (prime number — reduces clustering and ensures better distribution)
- **Total slots**: 604 (4 levels × 151)
- **Slot states**: `E` (Empty), `O` (Occupied), `D` (Deleted/Tombstone)

### Hash Function

```
h(id) = id % 151
```

Simple modular hashing. The prime capacity ensures that the hash function distributes keys more uniformly than a composite number would.

### Quadratic Probing (Bidirectional)

When the target slot is occupied, the engine probes in both positive and negative quadratic directions:

```
For i = 0, 1, 2, 3, ...
  Try: (h + i²) % 151      (positive direction)
  Try: (h - i²) % 151      (negative direction, wraps around if negative)
```

This bidirectional approach reduces secondary clustering and explores the table more evenly than single-direction quadratic probing.

### Identifier Encoding

Each student's physical location is encoded as a single integer:

```
identifierIndex = slotIndex + (levelIndex × 10000)
```

Decoding:
```
levelIndex = identifierIndex / 10000    (integer division)
slotIndex  = identifierIndex % 10000
```

This encoding allows all three index maps to store a single integer that fully identifies where a student record lives in the 2D array.

### Multi-Index Maps

| Index | Type | Key | Value | Purpose |
|-------|------|-----|-------|---------|
| `IdMap` | `HashMap<Integer, Integer>` | Student ID | identifierIndex | O(1) lookup by ID |
| `firstNameMap` | `HashMap<String, ArrayList<Integer>>` | First name | List of identifierIndexes | O(1) lookup by first name |
| `lastNameMap` | `HashMap<String, ArrayList<Integer>>` | Last name | List of identifierIndexes | O(1) lookup by last name |

### Operations

| Operation | Algorithm | Index Updates |
|-----------|-----------|---------------|
| **Insert** | Hash → quadratic probe → place in first available slot → update all 3 indices | Add to IdMap, firstNameMap, lastNameMap |
| **Search by ID** | IdMap lookup → decode identifierIndex → direct array access | None |
| **Search by name** | nameMap lookup → iterate identifierIndexes → decode each → collect results | None |
| **Delete** | Mark slot as "D" (tombstone) → remove from all 3 index maps | Remove from all 3 maps |
| **Edit (name)** | Update slot in-place → update affected name index map | Update changed nameMap |
| **Edit (level)** | Delete from old level → re-insert into new level | Full re-index (level determines physical location) |

### Tombstone Deletion

Deleted slots are marked `"D"` rather than `"E"` to preserve the quadratic probing chain. Without tombstones, a deletion could break the probe path for other records that were inserted after the deleted one.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Backend | Java 17 + Spring Boot 3.2 | REST API, validation, JSON serialization |
| Engine | Custom Java (Collector.java) | Hash table, probing, multi-index maps |
| Frontend | React 18 + Vite 5 | Component-based UI |
| Styling | Tailwind CSS 3.4 | Utility-first responsive design |
| Animation | Framer Motion 11 | Page transitions, probing animations |
| Charts | Recharts 2.12 | Performance comparison charts |
| Icons | Lucide React | Consistent icon set |

---

## Getting Started

### Prerequisites

- **Java 17+** and **Maven 3.8+** (backend)
- **Node.js 18+** and **npm 9+** (frontend)

### Backend Setup

```bash
cd Implementation/backend

# Build and run
mvn clean install
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### Frontend Setup

```bash
cd Implementation/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Quick Start

1. Start the backend (`mvn spring-boot:run`)
2. Start the frontend (`npm run dev`)
3. Open `http://localhost:5173`
4. Click **"Load Sample Data"** from the Dashboard or Import page
5. Explore the visualization, run searches, and watch the probing animations

---

## API Reference

Base URL: `http://localhost:8080/api/students`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all students |
| `POST` | `/` | Add a new student |
| `PUT` | `/{id}` | Update a student |
| `DELETE` | `/{id}` | Delete a student |
| `GET` | `/search/id/{id}` | Search by student ID |
| `GET` | `/search/firstName/{name}` | Search by first name |
| `GET` | `/search/lastName/{name}` | Search by last name |
| `GET` | `/level/{level}` | List students by level (FR/SO/JR/SR) |
| `GET` | `/stats` | Engine statistics |
| `GET` | `/hash-table` | Full hash table state (for visualization) |
| `POST` | `/load-sample` | Load sample dataset |
| `POST` | `/reset` | Reset engine (clear all data) |
| `POST` | `/import-csv` | Import CSV data |
| `GET` | `/performance/{type}/{key}` | Performance comparison (indexed vs linear) |

Every mutating or search operation returns a detailed `OperationTrace` in the response, containing the full probing sequence, collision count, index updates, and timing information.

---

## Project Structure

```
Implementation/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/indexing/
│       ├── IndexingEngineApplication.java    # Spring Boot entry point
│       ├── engine/
│       │   ├── Student.java                  # Student record (preserved from original)
│       │   └── Collector.java                # Core engine (preserved algorithm + tracing)
│       ├── model/
│       │   ├── ApiResponse.java              # Generic API response wrapper
│       │   ├── OperationTrace.java           # Detailed operation trace for visualization
│       │   ├── ProbeStep.java                # Single step in probing sequence
│       │   ├── StudentDTO.java               # Request/response DTO with validation
│       │   ├── HashTableState.java           # Full table state for grid visualization
│       │   ├── LevelState.java               # Single level's slot data
│       │   ├── SlotState.java                # Individual slot metadata
│       │   ├── EngineStats.java              # Aggregate engine statistics
│       │   └── PerformanceComparison.java    # Indexed vs linear comparison data
│       ├── service/
│       │   └── StudentService.java           # Business logic layer
│       ├── controller/
│       │   └── StudentController.java        # REST endpoints
│       └── config/
│           ├── CorsConfig.java               # CORS configuration
│           └── WebConfig.java                # Web configuration
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx                          # React entry point
│       ├── App.jsx                           # Routing + sidebar layout
│       ├── api.js                            # Axios API client
│       ├── index.css                         # Tailwind + custom styles
│       └── pages/
│           ├── Landing.jsx                   # Landing page with project introduction
│           ├── Dashboard.jsx                 # Stats, metrics, occupancy grid
│           ├── StudentManagement.jsx         # CRUD + operation trace panel
│           ├── Visualization.jsx             # Hash table grid + probing simulation
│           ├── Performance.jsx               # Indexed vs linear benchmarks
│           ├── Import.jsx                    # CSV import + sample data loading
│           └── TechnicalDesign.jsx           # Architecture documentation
│
└── README.md
```

---

## Complexity Analysis

| Operation | Average Case | Worst Case | Notes |
|-----------|:----------:|:----------:|-------|
| Insert | O(1) | O(n) | Amortized O(1) when load factor < 0.7 |
| Search by ID | O(1) | O(1) | Direct HashMap + array access |
| Search by Name | O(k) | O(k) | k = number of students with that name |
| Delete | O(1) | O(1) | Mark tombstone + remove from 3 maps |
| Edit (name) | O(1) | O(1) | In-place update + index map update |
| Edit (level) | O(1) | O(n) | Requires delete + re-insert (different physical location) |
| List by Level | O(c) | O(c) | c = capacity (151), scan one level's array |
| Linear Search | O(n) | O(n) | Baseline comparison — scans all 604 slots |

**Space Complexity**: O(n) for the hash table + O(n) for each of the 3 index maps = O(4n) = O(n)

**Load Factor Impact**: With capacity 151 per level and ~50-75 students per level, the load factor stays around 0.33-0.50, keeping collision rates low and amortized O(1) performance strong.

---

## Author

Built by **Abdullah Alhydary** as the ICS202 Data Structures & Algorithms course project at KFUPM.

The original console-based Java implementation was preserved as the core algorithmic engine and upgraded into a full-stack visualization platform demonstrating multi-index hash table storage, quadratic probing, and efficient multi-path retrieval.
