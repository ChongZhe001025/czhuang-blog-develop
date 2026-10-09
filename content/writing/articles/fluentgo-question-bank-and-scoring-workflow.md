# Building FluentGO's Question-Bank and Scoring Workflow

FluentGO grew out of the earlier GoTOEIC project. The development conversations moved from runtime and data-store questions into a more complete learning workflow: migrate the persistence layer, move scoring to the backend, import question data, classify grammar questions and improve recommendations.

This article follows that evolution as one product rather than treating the rename as a separate application.

## 1. Stabilize the service boundary

Early work investigated container startup, protected resource requests returning `401`, and whether the application was still using MongoDB. The next step was to move the service toward PostgreSQL and make scoring a backend responsibility.

The current project boundary is a Go API plus PostgreSQL; the API bootstraps its schema at startup. Question content and session scoring are handled on the server, while the client submits answers and renders the returned session state. This avoids maintaining an independent scoring implementation in each browser screen.

Keeping scoring on the backend has two benefits: the rule implementation has one source of truth, and the client receives a consistent result regardless of which screen initiated the exercise. The API contract should make the submitted answer, question identity and returned score explicit.

## 2. Import question data as a pipeline

The question-bank work included importing JSON, cleaning parsing results and organizing image assets. Treat import as a sequence of validation steps rather than a one-time script:

```text
source JSON
  -> parse and validate
  -> normalize question and answer fields
  -> classify question type
  -> resolve asset references
  -> persist
  -> compare import counts and sample records
```

Reject malformed records with a useful reason. Preserve a stable source identifier where possible so a corrected import can update a question instead of creating a duplicate. Validate that each question has an answer and that any referenced image can be loaded.

The project exposes repeatable import and coverage-report commands:

```sh
make import-questions
make question-coverage-report
```

Compare accepted/rejected counts and sample records after import. A successful database write is not proof that the answer key, grammar label or media URL is correct.

## 3. Make grammar classification useful to the learner

The classification work analyzed TOEIC grammar question types and later refined question recommendations. Classification should support the learning experience, not merely add labels to the database. Define a small, reviewable taxonomy and test it against representative questions before using it to build a practice set.

When a question could fit multiple categories, allow a primary category plus secondary tags or keep the item in a review queue. Avoid silently assigning a confident label to low-quality parsing output.

## 4. Keep scoring deterministic and testable

The backend scoring service should accept a stable question identifier and the learner's selected answer, then return a result that the client can render consistently. Test:

- correct and incorrect answers;
- empty or malformed submissions;
- duplicate submissions;
- question records missing an answer key;
- scores aggregated across a practice session.

Recommendation logic can then use validated question classifications and learner results. Keep the initial recommendation rules inspectable so it is possible to explain why a question was selected.

The documented demo flow seeds deterministic practice data and exercises one shared runtime through session creation, answer submission, finish, event recording, metrics projection, review-queue updates and recommendation updates. This follows a result beyond the immediate score response. Report it as a verified execution path only when that command was run and its output was captured.

## 5. Verify the complete learning path

The project work covered database changes, question imports, frontend behavior, a hook dependency correction, production setup and external connectivity. A meaningful end-to-end check should follow a learner from loading a practice set through submitting an answer, receiving a backend score and seeing the result reflected in the next recommendation.

Also reconcile the question count before and after import, inspect a sample from each grammar category, and verify that referenced media resolves in the deployed environment.

## What this evolution demonstrates

The strongest technical story is the progression from a question repository to a learning workflow: structured content, backend-owned scoring, classification and recommendation. The article should distinguish implemented behavior from recommendation ideas that were still being refined, and should not claim learning gains without user or outcome data.
