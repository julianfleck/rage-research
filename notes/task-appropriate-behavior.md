---
title: Task-appropriate behavior
definition: "How much diversity a task should produce — we can measure a task's spread, but cannot yet say what spread is right for it. Still open."
description: We can measure the semantic diversity of what a task produces; deciding what diversity a task should have is still open.
date: 2026-06-13
series: Lab notes
status: draft
version: 1
show: true
author: Julian Fleck
tags: [behavior, substrate, diversity]
---

# Task-appropriate behavior

What counts as good behavior depends on the task. "Add a calendar entry" should resolve quickly over a narrow set of nodes; an open research task should range much more widely before it settles. The same narrowness is fine for the first and premature for the second.

We can measure one side of this. [[hill-diversity|Hill numbers]] read the semantic diversity of the set of nodes a task produces — how many kinds of framing it drew on, and how evenly. That tells us how broadly a task actually ranged, and lets us compare runs against each other.

<Figure id="task-spread" margin caption="Two task runs: a narrow task draws on a few tightly clustered framings, an open one spreads across many." />

What we do not have is a way to say what spread a task *should* have. There is no mapping yet from a task to the diversity it warrants, and no threshold that separates appropriate narrowness from premature collapse. Whether that can be set per task, fixed per class of task, or learned at all is open.

So for now this is a measurement without a referent. The diversity signal is real; the judgment that would turn it into "appropriate" is the part we have not worked out.

One route worth tracking: learn the referent from experience rather than setting it in advance. If we keep the diversity signatures of tasks that went well and read them after the fact, "appropriate" could be recovered from what actually worked for tasks of that kind — a calibration grown from successful runs instead of declared up front. Whether that generalizes, or just overfits the runs we happened to see, is part of what we would have to find out.

<Related tags="metric" title="Related metrics" />
