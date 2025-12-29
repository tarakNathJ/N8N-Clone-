# FlowCraft - Comprehensive Test Cases

![alt text](<Screenshot From 2025-12-29 13-04-32.jpg>)


# Test account


{
"email":"tarak355@gmail.com",
"name":"tarak",
"password":"1234"
}

This document contains detailed test cases for the FlowCraft (N8N Clone) workflow automation platform. Test cases are organized by component and include unit tests, integration tests, and end-to-end tests.

## Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [Authentication Tests](#authentication-tests)
3. [Workflow Management Tests](#workflow-management-tests)
4. [Workflow Execution Tests](#workflow-execution-tests)
5. [Integration Tests](#integration-tests)
6. [Worker Service Tests](#worker-service-tests)
7. [Database Tests](#database-tests)
8. [Frontend Tests](#frontend-tests)
9. [Performance Tests](#performance-tests)
10. [Security Tests](#security-tests)

---

## Test Environment Setup

### Prerequisites

```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev supertest @types/supertest
npm install --save-dev cypress

# Set up test database
DATABASE_URL="postgresql://test:test@localhost:5432/workflow_test_db"
```

### Test Configuration

**jest.config.js**

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/*.test.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## Authentication Tests

### TC-AUTH-001: User Registration - Valid Data

**Priority:** High  
**Type:** Functional  
**Component:** Auth Service

**Test Steps:**

1. Send POST request to `/api/auth/signup`
2. Include valid user data in request body
3. Verify response status is 201
4. Verify JWT token is returned
5. Verify user object contains correct data
6. Verify password is hashed in database

**Test Data:**

```json
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "name": "Test User"
}
```

**Expected Result:**

- Status: 201 Created
- Response contains JWT token
- User created in database with hashed password
- Email is unique in system

**Test Code:**

```typescript
describe("User Registration", () => {
  it("should register a new user with valid data", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      email: "test@example.com",
      password: "SecurePass123!",
      name: "Test User",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.user).not.toHaveProperty("password");
  });
});
```

---

### TC-AUTH-002: User Registration - Duplicate Email

**Priority:** High  
**Type:** Negative  
**Component:** Auth Service

**Precondition:**

- User with email "existing@example.com" already exists

**Test Steps:**

1. Send POST request to `/api/auth/signup`
2. Use email that already exists
3. Verify response status is 409
4. Verify error message indicates duplicate email

**Expected Result:**

- Status: 409 Conflict
- Error message: "Email already exists"
- No new user created

**Test Code:**

```typescript
it("should reject registration with duplicate email", async () => {
  // Create first user
  await request(app).post("/api/auth/signup").send({
    email: "existing@example.com",
    password: "Pass123!",
    name: "First User",
  });

  // Attempt duplicate registration
  const response = await request(app).post("/api/auth/signup").send({
    email: "existing@example.com",
    password: "DifferentPass123!",
    name: "Second User",
  });

  expect(response.status).toBe(409);
  expect(response.body.error).toContain("already exists");
});
```

---

### TC-AUTH-003: User Login - Valid Credentials

**Priority:** High  
**Type:** Functional  
**Component:** Auth Service

**Precondition:**

- User account exists with email "user@example.com" and password "Pass123!"

**Test Steps:**

1. Send POST request to `/api/auth/login`
2. Include valid credentials
3. Verify response status is 200
4. Verify JWT token is returned
5. Verify token contains correct user ID

**Expected Result:**

- Status: 200 OK
- Valid JWT token returned
- Token can be verified and decoded

**Test Code:**

```typescript
it("should login user with valid credentials", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: "user@example.com",
    password: "Pass123!",
  });

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("token");

  // Verify token
  const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
  expect(decoded).toHaveProperty("userId");
});
```

---

### TC-AUTH-004: User Login - Invalid Password

**Priority:** High  
**Type:** Negative  
**Component:** Auth Service

**Test Steps:**

1. Send POST request to `/api/auth/login`
2. Use valid email with incorrect password
3. Verify response status is 401
4. Verify error message

**Expected Result:**

- Status: 401 Unauthorized
- Error message: "Invalid credentials"
- No token returned

---

### TC-AUTH-005: JWT Token Validation

**Priority:** High  
**Type:** Security  
**Component:** Auth Middleware

**Test Steps:**

1. Make request to protected endpoint with valid token
2. Verify request succeeds
3. Make request with expired token
4. Verify request fails with 401
5. Make request with invalid token
6. Verify request fails with 401

**Expected Result:**

- Valid tokens allow access
- Expired/invalid tokens return 401
- User context is attached to request

---

## Workflow Management Tests

### TC-WORK-001: Create Workflow - Valid Data

**Priority:** High  
**Type:** Functional  
**Component:** Workflow Service

**Precondition:**

- User is authenticated

**Test Steps:**

1. Send POST request to `/api/workflows`
2. Include valid workflow data with steps
3. Verify response status is 201
4. Verify workflow is created in database
5. Verify steps are associated correctly

**Test Data:**

```json
{
  "name": "Email Notification Workflow",
  "description": "Send email on trigger",
  "steps": [
    {
      "stepOrder": 1,
      "type": "TRIGGER",
      "actionType": "webhook",
      "config": {
        "method": "POST"
      }
    },
    {
      "stepOrder": 2,
      "type": "ACTION",
      "actionType": "email",
      "config": {
        "to": "user@example.com",
        "subject": "Test Email"
      }
    }
  ]
}
```

**Expected Result:**

- Status: 201 Created
- Workflow ID returned
- All steps created with correct order
- Workflow associated with authenticated user

**Test Code:**

```typescript
describe("Workflow Creation", () => {
  it("should create workflow with multiple steps", async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post("/api/workflows")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Workflow",
        steps: [
          { stepOrder: 1, type: "TRIGGER", actionType: "webhook" },
          { stepOrder: 2, type: "ACTION", actionType: "email" },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.workflow).toHaveProperty("id");
    expect(response.body.workflow.steps).toHaveLength(2);
  });
});
```

---

### TC-WORK-002: Get All Workflows

**Priority:** High  
**Type:** Functional  
**Component:** Workflow Service

**Precondition:**

- User has created 3 workflows
- Another user has created 2 workflows

**Test Steps:**

1. Authenticate as first user
2. Send GET request to `/api/workflows`
3. Verify response contains only first user's workflows
4. Verify pagination works correctly

**Expected Result:**

- Returns only authenticated user's workflows
- Correct count returned
- Workflows include step information

---

### TC-WORK-003: Update Workflow

**Priority:** High  
**Type:** Functional  
**Component:** Workflow Service

**Test Steps:**

1. Create a workflow
2. Send PUT request to `/api/workflows/:id`
3. Update workflow name and steps
4. Verify changes are saved
5. Verify version history is maintained

**Expected Result:**

- Workflow updated successfully
- Old data replaced with new data
- Timestamps updated

---

### TC-WORK-004: Delete Workflow

**Priority:** Medium  
**Type:** Functional  
**Component:** Workflow Service

**Test Steps:**

1. Create a workflow with execution history
2. Send DELETE request to `/api/workflows/:id`
3. Verify workflow is marked as deleted/archived
4. Verify execution history is preserved
5. Verify workflow no longer appears in list

**Expected Result:**

- Workflow soft-deleted
- Historical data retained
- Cannot be executed after deletion

---

### TC-WORK-005: Workflow Authorization

**Priority:** High  
**Type:** Security  
**Component:** Workflow Service

**Test Steps:**

1. User A creates a workflow
2. User B attempts to access User A's workflow
3. Verify access is denied with 403

**Expected Result:**

- Users cannot access other users' workflows
- Appropriate error message returned

---

## Workflow Execution Tests

### TC-EXEC-001: Execute Simple Workflow

**Priority:** High  
**Type:** Integration  
**Component:** Worker Service

**Test Steps:**

1. Create workflow with single HTTP request step
2. Trigger workflow execution
3. Verify workflow run is created
4. Verify step executes successfully
5. Verify execution status is updated

**Test Data:**

```json
{
  "workflowId": "uuid-here",
  "steps": [
    {
      "type": "ACTION",
      "actionType": "http",
      "config": {
        "url": "https://httpbin.org/post",
        "method": "POST",
        "body": { "test": "data" }
      }
    }
  ]
}
```

**Expected Result:**

- WorkflowRun created with status RUNNING
- HTTP request executed
- Status updated to SUCCESS
- Response stored in database

---

### TC-EXEC-002: Execute Multi-Step Workflow

**Priority:** High  
**Type:** Integration  
**Component:** Worker Service

**Test Steps:**

1. Create workflow with 3 steps (trigger → condition → action)
2. Trigger execution
3. Verify steps execute in correct order
4. Verify data flows between steps
5. Verify all step runs are recorded

**Expected Result:**

- Steps execute sequentially
- Output from one step available to next
- All step runs recorded with timing

---

### TC-EXEC-003: Workflow Execution with Failure

**Priority:** High  
**Type:** Negative  
**Component:** Worker Service

**Test Steps:**

1. Create workflow with failing HTTP request
2. Execute workflow
3. Verify failure is caught and logged
4. Verify workflow status is FAILED
5. Verify error message is stored

**Expected Result:**

- Execution stops at failed step
- Error details captured
- Status set to FAILED
- No subsequent steps execute

---

### TC-EXEC-004: Conditional Workflow Execution

**Priority:** Medium  
**Type:** Functional  
**Component:** Worker Service

**Test Steps:**

1. Create workflow with condition step
2. Execute with data that passes condition
3. Verify downstream steps execute
4. Execute with data that fails condition
5. Verify downstream steps skipped

**Expected Result:**

- Condition evaluated correctly
- Appropriate path taken
- Execution logged properly

---

### TC-EXEC-005: Concurrent Workflow Execution

**Priority:** High  
**Type:** Performance  
**Component:** Worker Service

**Test Steps:**

1. Trigger 10 workflow executions simultaneously
2. Verify all executions complete
3. Verify no race conditions
4. Verify execution times are reasonable

**Expected Result:**

- All workflows complete successfully
- No database deadlocks
- Execution times < 30 seconds each

---

## Integration Tests

### TC-INT-001: Email Integration - Send Email

**Priority:** High  
**Type:** Integration  
**Component:** AutoWorker Service

**Precondition:**

- Gmail SMTP credentials configured

**Test Steps:**

1. Create workflow with email step
2. Execute workflow
3. Verify email sent via Gmail SMTP
4. Verify delivery status recorded

**Test Data:**

```json
{
  "to": "recipient@example.com",
  "subject": "Test Email from FlowCraft",
  "body": "This is a test email"
}
```

**Expected Result:**

- Email sent successfully
- No SMTP errors
- Delivery confirmed

**Test Code:**

```typescript
describe("Email Integration", () => {
  it("should send email successfully", async () => {
    const workflowRun = await createWorkflowRun({
      steps: [
        {
          type: "ACTION",
          actionType: "email",
          config: {
            to: "test@example.com",
            subject: "Test",
            body: "Test email",
          },
        },
      ],
    });

    await executeWorkflow(workflowRun.id);

    const run = await getWorkflowRun(workflowRun.id);
    expect(run.status).toBe("SUCCESS");
    expect(run.stepRuns[0].output).toContain("Email sent");
  });
});
```

---

### TC-INT-002: Telegram Integration

**Priority:** Medium  
**Type:** Integration  
**Component:** Worker Service

**Precondition:**

- Telegram bot token configured

**Test Steps:**

1. Create workflow with Telegram step
2. Execute workflow
3. Verify message sent to Telegram
4. Check message appears in chat

**Expected Result:**

- Message sent successfully
- Appears in correct chat
- Formatting preserved

---

### TC-INT-003: AWS S3 Integration - File Upload

**Priority:** Medium  
**Type:** Integration  
**Component:** Worker Service

**Test Steps:**

1. Create workflow with S3 upload step
2. Execute with test file
3. Verify file uploaded to S3
4. Verify file accessible via S3 URL

**Expected Result:**

- File uploaded successfully
- Correct bucket and key
- File content intact

---

### TC-INT-004: HTTP API Integration

**Priority:** High  
**Type:** Integration  
**Component:** Worker Service

**Test Steps:**

1. Create workflow calling external API
2. Test GET, POST, PUT, DELETE methods
3. Verify responses handled correctly
4. Test error handling for API failures

**Expected Result:**

- All HTTP methods work
- Response data captured
- Errors handled gracefully

---

## Worker Service Tests

### TC-WORK-001: Kafka Message Consumption

**Priority:** High  
**Type:** Integration  
**Component:** Worker Service

**Test Steps:**

1. Send workflow execution message to Kafka
2. Verify worker consumes message
3. Verify execution starts
4. Verify acknowledgment sent

**Expected Result:**

- Message consumed within 1 second
- Execution initiated
- No message loss

---

### TC-WORK-002: Worker Pool Scaling

**Priority:** Medium  
**Type:** Performance  
**Component:** Worker Service

**Test Steps:**

1. Start with 2 worker instances
2. Queue 100 workflow executions
3. Monitor execution rate
4. Add 2 more workers
5. Verify execution rate increases

**Expected Result:**

- Workers process in parallel
- Adding workers increases throughput
- No execution conflicts

---

### TC-WORK-003: Worker Failure Recovery

**Priority:** High  
**Type:** Resilience  
**Component:** Worker Service

**Test Steps:**

1. Start workflow execution
2. Kill worker mid-execution
3. Verify message redelivered
4. Verify new worker picks up execution
5. Verify no duplicate execution

**Expected Result:**

- Execution completes
- Only executed once
- Status correctly updated

---

## Database Tests

### TC-DB-001: Connection Pool Management

**Priority:** High  
**Type:** Performance  
**Component:** Database Package

**Test Steps:**

1. Open 50 concurrent database connections
2. Execute queries on all connections
3. Verify pool limits enforced
4. Close connections
5. Verify connections released

**Expected Result:**

- Pool size limited correctly
- No connection leaks
- Performance remains stable

---

### TC-DB-002: Transaction Handling

**Priority:** High  
**Type:** Functional  
**Component:** Prisma ORM

**Test Steps:**

1. Start database transaction
2. Create workflow and steps
3. Intentionally fail during step creation
4. Verify rollback occurs
5. Verify no partial data remains

**Expected Result:**

- Transaction rolled back completely
- Database remains consistent
- No orphaned records

---

### TC-DB-003: Outbox Pattern Implementation

**Priority:** High  
**Type:** Integration  
**Component:** Processor Service

**Test Steps:**

1. Create workflow execution
2. Insert message into outbox table
3. Verify processor picks up message
4. Verify message sent to Kafka
5. Verify outbox status updated

**Expected Result:**

- Guaranteed message delivery
- Exactly-once semantics
- Outbox cleaned up after processing

---

## Frontend Tests

### TC-FE-001: Workflow Editor - Node Creation

**Priority:** High  
**Type:** E2E  
**Component:** React Flow Editor

**Test Steps:**

1. Open workflow editor
2. Drag node from sidebar to canvas
3. Verify node appears on canvas
4. Verify node has unique ID
5. Connect two nodes
6. Verify connection created

**Expected Result:**

- Nodes render correctly
- Connections visualized
- State updated properly

**Cypress Test:**

```javascript
describe("Workflow Editor", () => {
  it("should create and connect nodes", () => {
    cy.visit("/editor/new");

    // Drag trigger node
    cy.get('[data-node-type="trigger"]').drag(".react-flow-wrapper");
    cy.get(".react-flow__node").should("have.length", 1);

    // Drag action node
    cy.get('[data-node-type="action"]').drag(".react-flow-wrapper", {
      position: { x: 300, y: 0 },
    });
    cy.get(".react-flow__node").should("have.length", 2);

    // Connect nodes
    cy.get(".react-flow__handle-right").first().click();
    cy.get(".react-flow__handle-left").last().click();
    cy.get(".react-flow__edge").should("have.length", 1);
  });
});
```

---

### TC-FE-002: Workflow Editor - Node Configuration

**Priority:** High  
**Type:** Functional  
**Component:** React Flow Editor

**Test Steps:**

1. Create an action node
2. Click to open configuration panel
3. Fill in configuration fields
4. Save configuration
5. Verify data saved in node

**Expected Result:**

- Configuration panel opens
- Fields validated correctly
- Data persisted to node

---

### TC-FE-003: Dashboard - Workflow List

**Priority:** Medium  
**Type:** Functional  
**Component:** Dashboard

**Test Steps:**

1. Navigate to dashboard
2. Verify workflows are displayed
3. Test search functionality
4. Test filtering by status
5. Test sorting options

**Expected Result:**

- All workflows visible
- Search works correctly
- Filters apply properly

---

### TC-FE-004: Real-time Execution Status

**Priority:** Medium  
**Type:** Functional  
**Component:** Dashboard

**Test Steps:**

1. Start a workflow execution
2. Open workflow detail page
3. Verify status updates in real-time
4. Verify step progress displayed
5. Verify completion notification

**Expected Result:**

- Status updates without refresh
- Progress bar updates
- Toast notification on completion

---

## Performance Tests

### TC-PERF-001: API Response Time

**Priority:** High  
**Type:** Performance  
**Component:** API Gateway

**Test Criteria:**

- GET /api/workflows: < 200ms (95th percentile)
- POST /api/workflows: < 500ms (95th percentile)
- POST /api/workflows/:id/execute: < 100ms (95th percentile)

**Test Steps:**

1. Execute 1000 requests to each endpoint
2. Measure response times
3. Calculate percentiles
4. Verify meets criteria

---

### TC-PERF-002: Workflow Execution Throughput

**Priority:** High  
**Type:** Performance  
**Component:** Worker Service

**Test Criteria:**

- Execute 100 workflows in < 60 seconds with 5 workers
- Execute 1000 workflows in < 300 seconds with 10 workers

**Test Steps:**

1. Queue multiple workflow executions
2. Monitor completion time
3. Measure throughput (workflows/second)
4. Verify no failures

---

### TC-PERF-003: Database Query Performance

**Priority:** High  
**Type:** Performance  
**Component:** Database

**Test Criteria:**

- Workflow list query: < 50ms
- Single workflow detail: < 30ms
- Execution history query: < 100ms

**Test Steps:**

1. Populate database with 10,000 workflows
2. Execute queries
3. Measure execution time
4. Verify indexes used

---

## Security Tests

### TC-SEC-001: SQL Injection Prevention

**Priority:** High  
**Type:** Security  
**Component:** API Services

**Test Steps:**

1. Attempt SQL injection in workflow name
2. Try injection in search parameters
3. Test prepared statement usage
4. Verify Prisma ORM protections

**Test Payloads:**

```
'; DROP TABLE workflows; --
" OR 1=1 --
' UNION SELECT * FROM users --
```

**Expected Result:**

- No SQL injection possible
- Malicious input escaped
- Error handling appropriate

---

### TC-SEC-002: XSS Prevention

**Priority:** High  
**Type:** Security  
**Component:** Frontend

**Test Steps:**

1. Create workflow with malicious script in name
2. Verify script not executed when displayed
3. Test HTML entity encoding
4. Verify CSP headers present

**Test Payloads:**

```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```

**Expected Result:**

- Scripts not executed
- Content properly escaped
- CSP prevents inline scripts

---

### TC-SEC-003: Authentication Bypass Attempts

**Priority:** High  
**Type:** Security  
**Component:** Auth Middleware

**Test Steps:**

1. Attempt to access protected endpoint without token
2. Try with invalid token
3. Try with expired token
4. Attempt token tampering

**Expected Result:**

- All attempts rejected with 401
- No data leaked
- Attempts logged

---

### TC-SEC-004: Rate Limiting

**Priority:** Medium  
**Type:** Security  
**Component:** API Gateway

**Test Steps:**

1. Send 1000 requests in 1 minute
2. Verify rate limiting kicks in
3. Verify 429 status returned
4. Wait for limit reset
5. Verify requests allowed again

**Expected Result:**

- Rate limit enforced
- Appropriate error message
- Limits reset correctly

---

## Test Execution Checklist

### Pre-Deployment Testing

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security scans clean
- [ ] Code coverage > 80%

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run unit tests
        run: npm test
      - name: Run integration tests
        run: npm run test:integration
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload coverage
        run: npm run coverage:upload
```

### Manual Testing Checklist

- [ ] User registration flow
- [ ] User login flow
- [ ] Workflow creation
- [ ] Workflow execution
- [ ] Email integration
- [ ] Telegram integration
- [ ] Dashboard functionality
- [ ] Real-time updates
- [ ] Error handling
- [ ] Mobile responsiveness

---

## Test Coverage Report

Target coverage: **80%** minimum

```
--------------------------------|---------|----------|---------|---------|
File                            | % Stmts | % Branch | % Funcs | % Lines |
--------------------------------|---------|----------|---------|---------|
All files                       |   85.23 |    78.45 |   82.11 |   85.67 |
 auth/                          |   92.14 |    85.23 |   88.45 |   91.89 |
  auth.controller.ts            |   94.23 |    87.12 |   91.23 |   93.45 |
  auth.service.ts               |   89.34 |    82.45 |   84.67 |   89.12 |
 workflow/                      |   88.45 |    81.23 |   85.34 |   87.89 |
  workflow.controller.ts        |   91.23 |    83.45 |   88.12 |   90.45 |
  workflow.service.ts           |   85.67 |    79.01 |   82.56 |   85.33 |
 worker/                        |   79.23 |    72.34 |   76.12 |   78.89 |
  worker.service.ts             |   81.45 |    74.23 |   78.34 |   80.67 |
--------------------------------|---------|----------|---------|---------|
```

---

## Bug Reporting Template

### Bug Report

**Title:** [Component] Brief description

**Priority:** High/Medium/Low

**Environment:**

- OS:
- Browser:
- Version:

**Steps to Reproduce:**

1.
2.
3.

**Expected Behavior:**

**Actual Behavior:**

**Screenshots/Logs:**

**Related Test Case:** TC-XXX-XXX

---

**Document Version:** 1.0.0  
**Last Updated:** December 29, 2025  
**Maintained by:** QA Team
