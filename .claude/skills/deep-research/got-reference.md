# Graph of Thoughts (GoT) Framework Reference

## What is GoT?

Graph of Thoughts models research as a graph where:
- **Nodes** = Research findings, insights, or conclusions
- **Edges** = Dependencies and relationships between findings
- **Scores** = Quality ratings (0-10) assigned to each node
- **Frontier** = Set of active nodes available for further exploration

Inspired by [SPCL, ETH Zurich](https://github.com/spcl/graph-of-thoughts).

## Core Operations

### Generate(k)
Create k new research paths from a parent node.
- Use at: start of research, expanding high-quality findings
- Implementation: spawn k sub-agents via `invokeSubAgent`, each exploring a distinct aspect

### Aggregate(k)
Combine k nodes into one comprehensive synthesis.
- Use at: multiple agents have researched related aspects, need cohesive whole
- Implementation: read all findings, resolve conflicts, extract key insights

### Refine(1)
Improve an existing finding without adding new research.
- Use at: good content needs better organization, citations, or clarity
- Implementation: rewrite for clarity, add missing citations, improve structure

### Score
Evaluate quality of a research finding (0-10).

**Scoring criteria:**
- 9-10: Multiple A-B sources, no contradictions, comprehensive
- 7-8: Adequate sources, minor ambiguities, good coverage
- 5-6: Mixed source quality, some contradictions, moderate coverage
- 3-4: Limited/low-quality sources, significant contradictions
- 0-2: No verifiable sources, major errors, severely incomplete

### KeepBestN(n)
Prune low-quality nodes, keeping only top n at each level.
- Use at: managing complexity, focusing resources on high-quality paths

## Research Patterns

### Pattern 1: Balanced (Most Common)
```
Iteration 1: Generate(4) from root
  → 4 parallel research paths
  → Score: [7.2, 8.5, 6.8, 7.9]

Iteration 2: Strategy based on scores
  → High (8.5): Generate(2) deeper
  → Medium (7.2, 7.9): Refine(1) each
  → Low (6.8): Discard

Iteration 3: Aggregate(3) best nodes → synthesis

Iteration 4: Refine(1) synthesis → final output
```

### Pattern 2: Breadth-First
Best for broad topics where you need wide coverage first.
```
Generate(5) → Score → KeepBestN(3)
Generate(2) from each best → Score → KeepBestN(3)
Aggregate(3) → final synthesis
```

### Pattern 3: Depth-First
Best for deep dives into specific high-value aspects.
```
Generate(3) → identify best (8.5)
Generate(3) from best only → KeepBestN(1)
Generate(2) from best child → KeepBestN(1)
Refine(1) → final deep finding
```

## Decision Logic

| Condition | Action |
|-----------|--------|
| Starting new research | Generate(3-5) |
| Score >= 7.0 | Generate deeper OR Refine |
| Score 5.0-6.9 | Refine OR discard |
| Score < 5.0 | Discard immediately |
| Multiple related findings | Aggregate |
| Good content, poor organization | Refine |
| Too many active nodes | KeepBestN |

## Graph State Tracking

Maintain state using this format in research notes:

```markdown
## GoT Graph State

### Nodes
| Node ID | Content Summary | Score | Parent | Status |
|---------|----------------|-------|--------|--------|
| root | Research topic | - | - | complete |
| 1 | Market analysis | 7.2 | root | complete |
| 2 | Tech assessment | 8.5 | root | complete |
| 3 | Case studies | 6.8 | root | discarded |
| final | Synthesis | 9.1 | [1,2] | complete |

### Operations Log
1. Generate(3) from root → nodes [1,2,3]
2. Score → [7.2, 8.5, 6.8]
3. KeepBestN(2) → keep [1,2], discard [3]
4. Aggregate(2) → final synthesis
5. Score final → 9.1
```

## Integration with 7-Phase Process

| Phase | GoT Operations |
|-------|---------------|
| Phase 2: Planning | Generate to break topic into subtopics |
| Phase 3: Querying | Generate + Score for multi-agent deployment |
| Phase 4: Triangulation | Score + KeepBestN for quality filtering |
| Phase 5: Synthesis | Aggregate + Refine for combining findings |
| Phase 6: QA | Score + Refine for quality assurance |

## Best Practices

1. Start simple: first iteration Generate(3-5) from root
2. Prune aggressively: score < 5.0 = discard immediately
3. Aggregate strategically: after 2-3 rounds of generation
4. Refine selectively: only nodes with score >= 7.0
5. Score consistently: same criteria throughout the research
6. Better to explore 3 paths deeply than 10 paths shallowly
