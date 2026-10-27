# CortexAI Security and Release Handover

## 1. Credential exposure

Development credentials were pasted during the project conversation. Treat all
of them as compromised, including database, Redis, model-provider, AWS,
Tavily, Qdrant, and payment credentials.

Before any public demo or deployment:

1. rotate MongoDB credentials;
2. rotate Redis credentials;
3. rotate Groq, Google, OpenRouter, and Tavily keys;
4. rotate Qdrant credentials;
5. rotate AWS access keys and inspect bucket access;
6. rotate Razorpay test credentials if reused;
7. update only local ignored `.env` files;
8. verify no secret appears in Git history, screenshots, logs, or docs.

Do not add real values to this handover pack.

## 2. Authentication

Authentication was intentionally removed for local use. The gateway supplies a
fixed anonymous identity. This is acceptable for a controlled local college
demo, but it is not acceptable for multi-user production deployment.

Before production:

- restore real authentication;
- authorize conversation ownership at every service boundary;
- isolate user memory and artifacts;
- protect billing endpoints;
- add rate limits tied to authenticated users.

## 3. Data privacy

Prompts, uploaded documents, responses, and traces may contain personal or
confidential information. Before collecting benchmark data:

- use public-domain or licensed documents;
- remove personal data;
- document retention;
- avoid committing traces;
- restrict access to generated artifacts;
- define deletion behavior.

## 4. Provider and storage risks

- Model providers may retain prompts depending on account settings.
- Qdrant temporary collections must always be cleaned up.
- S3 artifacts need private bucket policies and signed URLs.
- Redis memory has expiry but is not encryption at rest by itself.
- Logs should not print credentials or full sensitive prompts.

## 5. Release checklist

- [ ] Rotate all exposed credentials.
- [ ] Confirm `.env` and `frontend/.env` are ignored.
- [ ] Confirm no secrets in tracked files.
- [ ] Restore authentication if deploying publicly.
- [ ] Verify MongoDB, Redis, Qdrant, and storage access policies.
- [ ] Run backend tests.
- [ ] Run frontend production build.
- [ ] Run a labelled benchmark with a cost cap.
- [ ] Review generated traces for sensitive data.
- [ ] Review README claims and remove unsupported numbers.
- [ ] Create a backup and rollback plan.

## 6. Incident response

If a key is exposed:

1. revoke it immediately;
2. inspect provider logs for abuse;
3. rotate dependent secrets;
4. remove the value from working files;
5. search Git history and shared logs;
6. document the incident without reproducing the secret.
