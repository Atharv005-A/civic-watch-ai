

# DFD and ERD Diagrams with Standard Notation

## Problem
The diagrams need to follow standard DFD and ERD notation rules:
- **DFD**: Circles/rounded for processes, open rectangles (parallel lines) for data stores, rectangles for external entities, labeled arrows for data flows
- **ERD**: Proper crow's foot notation with cardinality (1, M, 0..1, 0..M), entity boxes with attributes and types, PK/FK markers

## Deliverables — 4 Mermaid files to `/mnt/documents/`

### 1. DFD Level 1 — Context Diagram
- One central process circle: **0.0 Civic-Eye System**
- External entities (rectangles): Citizen, Anonymous User, Admin, Authority, AI Engine, Email Service
- Labeled directional arrows showing all data flows (complaint data, status updates, notifications, analysis results, feedback)

### 2. DFD Level 2 — User Side
- Processes (numbered circles): 1.0 Authentication, 2.0 Submit Complaint, 3.0 AI Analysis, 4.0 View Dashboard, 5.0 View Heatmap, 6.0 Submit Feedback, 7.0 View Rewards
- Data stores (double-line notation): D1 Profiles, D2 Complaints, D3 Feedback, D4 User Rewards
- External entities: Citizen, Anonymous User, AI Engine
- All flows labeled with data names

### 3. DFD Level 2 — Admin Side
- Processes: 8.0 Manage Complaints, 9.0 Manage Users, 10.0 Manage Categories, 11.0 Respond to Feedback, 12.0 Generate Reports, 13.0 Manage Site Content, 14.0 Send Notifications
- Data stores: D1 Profiles, D2 Complaints, D3 User Roles, D4 Categories, D5 Feedback, D6 Site Content
- External entities: Admin, Authority, Email Service

### 4. ERD — Crow's Foot Notation
- 7 entities with all columns, types, PK/FK labels
- Relationships with proper cardinality using Mermaid `erDiagram` crow's foot syntax:
  - profiles ||--o{ complaints (one profile, zero-or-many complaints)
  - profiles ||--|| user_roles (one-to-one)
  - profiles ||--o| user_rewards (one-to-zero-or-one)
  - profiles ||--o{ feedback (one-to-zero-or-many)
  - complaint_categories (standalone, referenced by name)
  - site_content (standalone CMS)

## Technical Approach
- Mermaid `graph TD` for DFDs — use `([Process])` for rounded process nodes, `[(D1 Store)]` for data stores with double-line look, `[Entity]` for external entities
- Mermaid `erDiagram` for ERD — native crow's foot notation support with `||`, `o{`, `|{` symbols
- Clean labels, no emojis, readable in both light/dark themes

