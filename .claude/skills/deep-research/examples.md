# Deep Research — Examples

## Example 1: Market Research

**User**: "Research AI in healthcare"

**Phase 1 Response** (Question Scoping):
```
I'll help you research AI in healthcare. Let me ask a few questions to scope this properly:

1. What aspects interest you most? (clinical diagnosis, drug discovery, operations, patient care, imaging?)
2. Output format? (comprehensive report 20-30 pages, executive summary 3-5 pages, data analysis?)
3. Geographic focus? (US, Europe, Global?)
4. Time period? (current state, last 3 years, future projections?)
5. Audience? (technical team, executives, healthcare professionals?)
```

**After user answers** — Phase 2 (Retrieval Planning):
```markdown
## Research Plan: AI in Clinical Diagnosis

### Subtopics:
1. **Current Market Landscape**
   - Queries: "AI clinical diagnosis market size 2024", "FDA approved AI medical devices"
   - Sources: Industry reports, FDA databases

2. **Technology Assessment**
   - Queries: "AI diagnostic accuracy vs human clinicians", "medical imaging AI benchmarks"
   - Sources: Peer-reviewed journals, clinical validation studies

3. **Implementation & ROI**
   - Queries: "AI clinical implementation costs", "healthcare AI ROI analysis"
   - Sources: Case studies, vendor whitepapers

4. **Vendor Landscape**
   - Queries: "leading AI clinical diagnosis vendors 2024", "medical AI companies comparison"
   - Sources: Analyst reports, vendor comparisons

5. **Future Trends**
   - Queries: "AI healthcare trends 2025-2028", "emerging medical AI technologies"
   - Sources: Trend reports, expert forecasts

### Agent Deployment:
- 5 sub-agents (1 per subtopic) + 1 verification agent
- Expected output: 25-30 page report with executive summary

Shall I proceed?
```

### Output Structure:
```
RESEARCH/AI_Clinical_Diagnosis/
├── README.md
├── executive_summary.md
├── full_report.md
├── data/statistics.md
├── sources/bibliography.md
├── sources/source_quality_table.md
├── research_notes/findings_summary.md
└── appendices/methodology.md
```

---

## Example 2: Technology Assessment

**User**: "Deep dive into WebAssembly vs JavaScript performance"

**Structured Prompt**:
```markdown
### TASK
Evaluate WebAssembly vs JavaScript performance for production web applications.

### SPECIFIC QUESTIONS
1. Current maturity and browser support of WebAssembly?
2. Performance benchmarks: WASM vs JS for compute-heavy tasks?
3. Real-world case studies and successful implementations?
4. Available tooling, frameworks, and developer experience?
5. Limitations, debugging challenges, and browser compatibility?

### CONSTRAINTS
- Timeframe: 2023-2026
- Sources: Technical documentation, benchmark studies, developer community

### OUTPUT FORMAT
- Technical assessment (10-15 pages)
- Performance comparison tables
- Implementation recommendations
```

---

## Example 3: Academic Literature Review

**User**: "Literature review on transformer architectures"

**Agent deployment strategy**:
- Agent 1: Foundational architectures (Attention Is All You Need through GPT-4)
- Agent 2: Efficiency improvements (distillation, quantization, pruning)
- Agent 3: Applications across domains (NLP, vision, multimodal)
- Agent 4: Theoretical analysis and interpretability
- Agent 5: Cross-verification of key claims and citation counts

**Citation example in output**:
```
The original Transformer architecture introduced the self-attention mechanism that processes
all positions in a sequence simultaneously (Vaswani et al., 2017, "Attention Is All You Need",
NeurIPS, https://arxiv.org/abs/1706.03762). This approach achieved state-of-the-art results
on machine translation benchmarks, with BLEU scores of 28.4 on WMT 2014 English-to-German
(Vaswani et al., 2017, p. 8).
```

---

## Example 4: Competitive Analysis

**User**: "Competitive analysis of project management tools for dev teams"

**Source quality table example**:

| Source | Rating | Type | Why |
|--------|--------|------|-----|
| Gartner Magic Quadrant 2024 | B | Industry Report | Reputable analyst firm |
| G2 User Reviews (n=5000+) | C | Aggregated Reviews | Large sample but self-selected |
| Company SEC Filing | A | Primary Document | Official regulatory filing |
| TechCrunch article | C | News | Reputable outlet, not peer-reviewed |
| Reddit r/projectmanagement | D | Community | Anecdotal, unverified |

---

## Example 5: Quick Research (Narrow Topic)

**User**: "What's the current state of HTTP/3 adoption?"

For narrow topics, skip sub-agent deployment and research directly:
1. Use `remote_web_search` for 3-5 queries
2. Fetch content from top results
3. Synthesize into a focused report (5-10 pages)
4. Validate key statistics

Expected time: 5-10 minutes for narrow topics.
